import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Order, OrderFormData, AssignFormData } from '../types'
import { generateOrderRef } from '../lib/utils'
import toast from 'react-hot-toast'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, teams(id, name, color)')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to load orders')
      console.error(error)
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()

    // Realtime subscription
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchOrders])

  const addOrder = async (data: OrderFormData): Promise<boolean> => {
    const orderRef = generateOrderRef(orders.length)
    const { error } = await supabase.from('orders').insert({
      order_ref: orderRef,
      customer: data.customer,
      category: data.category,
      packaging: data.packaging,
      qty_ordered: data.qty_ordered,
      qty_done: 0,
      priority: data.priority,
      status: 'Pending',
      notes: data.notes || null,
      shift: data.shift,
    })

    if (error) {
      toast.error('Failed to add order')
      console.error(error)
      return false
    }
    toast.success(`Order added successfully`)
    return true
  }

  const assignOrder = async (orderId: string, data: AssignFormData): Promise<boolean> => {
    const now = new Date().toISOString()

    // Update order
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        team_id: data.team_id,
        status: 'Active',
        assigned_at: now,
        start_time: data.start_time ? new Date(`1970-01-01T${data.start_time}`).toISOString() : now,
      })
      .eq('id', orderId)

    if (orderError) {
      toast.error('Failed to assign order')
      console.error(orderError)
      return false
    }

    // Create packing assignment record
    const order = orders.find((o) => o.id === orderId)
    await supabase.from('packing_assignments').insert({
      order_id: orderId,
      team_id: data.team_id,
      assigned_by: 'Supervisor',
      start_time: now,
      qty_target: order?.qty_ordered || 0,
      qty_done: 0,
      notes: data.notes || null,
      status: 'Active',
    })

    toast.success('Order assigned to team')
    return true
  }

  const updateQtyDone = async (orderId: string, qtyDone: number): Promise<boolean> => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return false

    const newStatus = qtyDone >= order.qty_ordered ? 'Done' : 'Active'
    const { error } = await supabase
      .from('orders')
      .update({
        qty_done: qtyDone,
        status: newStatus,
        end_time: newStatus === 'Done' ? new Date().toISOString() : null,
      })
      .eq('id', orderId)

    if (error) {
      toast.error('Failed to update progress')
      return false
    }

    if (newStatus === 'Done') toast.success('Order marked complete!')
    return true
  }

  const markDone = async (orderId: string): Promise<boolean> => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return false
    return updateQtyDone(orderId, order.qty_ordered)
  }

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'Cancelled' })
      .eq('id', orderId)

    if (error) {
      toast.error('Failed to cancel order')
      return false
    }
    toast.success('Order cancelled')
    return true
  }

  return { orders, loading, addOrder, assignOrder, updateQtyDone, markDone, cancelOrder, refetch: fetchOrders }
}
