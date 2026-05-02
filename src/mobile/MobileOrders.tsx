import { useState } from 'react'
import { Order, Team } from '../types'
import { BottomSheet } from '../components/BottomSheet'
import { productivity, formatTime } from '../lib/utils'
import toast from 'react-hot-toast'

interface Props {
  orders: Order[]
  teams: Team[]
  onUpdateQty: (orderId: string, qty: number) => Promise<boolean>
  onMarkDone: (orderId: string) => Promise<boolean>
}

function teamColorClass(name: string) {
  const map: Record<string, string> = {
    'Team A': 'm-team-a', 'Team B': 'm-team-b',
    'Team C': 'm-team-c', 'Team D': 'm-team-d',
  }
  return map[name] || 'm-team-a'
}

function PriorityStripe({ priority }: { priority: string }) {
  const colors: Record<string, string> = { Urgent: '#FF4444', High: '#F4C542', Normal: 'transparent' }
  return (
    <div style={{
      position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
      background: colors[priority] || 'transparent',
      borderRadius: '20px 0 0 20px',
    }} />
  )
}

export function MobileOrders({ orders, teams, onUpdateQty, onMarkDone }: Props) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [qty, setQty] = useState(0)
  const [updating, setUpdating] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('active')

  const filtered = orders.filter((o) => {
    if (filter === 'active') return o.status === 'Active' || o.status === 'Assigned'
    if (filter === 'done') return o.status === 'Done'
    return o.status !== 'Cancelled'
  })

  const openUpdate = (order: Order) => {
    setSelectedOrder(order)
    setQty(order.qty_done)
  }

  const handleUpdateQty = async () => {
    if (!selectedOrder) return
    setUpdating(true)
    const ok = await onUpdateQty(selectedOrder.id, qty)
    setUpdating(false)
    if (ok) setSelectedOrder(null)
  }

  const handleMarkDone = async (order: Order) => {
    const ok = await onMarkDone(order.id)
    if (ok && selectedOrder?.id === order.id) setSelectedOrder(null)
  }

  const stepQty = (delta: number) => {
    if (!selectedOrder) return
    setQty((q) => Math.max(0, Math.min(selectedOrder.qty_ordered, q + delta)))
  }

  return (
    <div>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['active', 'all', 'done'] as const).map((f) => (
          <button
            key={f}
            className={`m-btn m-btn-secondary`}
            style={{
              flex: 1, padding: '10px 8px', fontSize: 13,
              ...(filter === f ? { borderColor: 'var(--m-green3)', color: 'var(--m-green)', background: '#0F2518' } : {}),
            }}
            onClick={() => setFilter(f)}
          >
            {f === 'active' ? 'Active' : f === 'done' ? 'Done' : 'All'}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="m-empty">
          <div className="m-empty-icon">📦</div>
          <div className="m-empty-text">No {filter} orders</div>
        </div>
      )}

      {filtered.map((order) => {
        const pct = productivity(order.qty_done, order.qty_ordered)
        const teamName = order.teams?.name || ''
        return (
          <div
            key={order.id}
            className="m-order-card"
            style={{ cursor: order.status === 'Active' ? 'pointer' : 'default' }}
            onClick={() => order.status === 'Active' && openUpdate(order)}
          >
            <PriorityStripe priority={order.priority} />

            <div style={{ paddingLeft: order.priority !== 'Normal' ? 12 : 0 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div className="m-order-customer">{order.customer}</div>
                <span style={{
                  fontFamily: "'DM Mono',monospace", fontSize: 11,
                  color: order.status === 'Done' ? 'var(--m-green)' : 'var(--m-text3)',
                }}>
                  {order.order_ref}
                </span>
              </div>

              <div className="m-order-meta">
                {order.category} · {order.packaging}
                {order.notes && <div style={{ marginTop: 2, color: 'var(--m-amber)' }}>⚠ {order.notes}</div>}
              </div>

              {/* Progress */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--m-text2)', marginBottom: 8 }}>
                <span className="m-qty">{order.qty_done} / {order.qty_ordered} units</span>
                <span style={{ color: pct === 100 ? 'var(--m-green)' : 'var(--m-text2)', fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{pct}%</span>
              </div>
              <div className="m-progress-bar">
                <div className="m-progress-fill" style={{
                  width: `${pct}%`,
                  background: pct === 100 ? 'var(--m-green)' : 'var(--m-green3)',
                }} />
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {teamName && <span className={`m-team ${teamColorClass(teamName)}`}>{teamName}</span>}
                  {order.start_time && (
                    <span style={{ fontSize: 11, color: 'var(--m-text3)' }}>
                      Start {formatTime(order.start_time)}
                    </span>
                  )}
                </div>
                {order.status === 'Active' && (
                  <span style={{ fontSize: 12, color: 'var(--m-green)', fontWeight: 600 }}>Tap to update ›</span>
                )}
                {order.status === 'Done' && (
                  <span className="m-pill m-pill-green">✓ Done</span>
                )}
                {order.status === 'Assigned' && (
                  <span className="m-pill m-pill-amber">Assigned</span>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Update qty sheet */}
      {selectedOrder && (
        <BottomSheet title={`Update Progress`} onClose={() => setSelectedOrder(null)}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{selectedOrder.customer}</div>
            <div style={{ fontSize: 13, color: 'var(--m-text2)' }}>{selectedOrder.category} · {selectedOrder.qty_ordered} units total</div>
          </div>

          {/* Visual progress */}
          <div style={{
            background: 'var(--m-bg3)', borderRadius: 16, padding: 20,
            textAlign: 'center', marginBottom: 20,
          }}>
            <div style={{
              fontFamily: "'DM Mono',monospace", fontSize: 40, fontWeight: 500,
              color: qty >= selectedOrder.qty_ordered ? 'var(--m-green)' : 'var(--m-text)',
              marginBottom: 4,
            }}>
              {qty}
            </div>
            <div style={{ fontSize: 13, color: 'var(--m-text3)', marginBottom: 14 }}>
              of {selectedOrder.qty_ordered} units
            </div>
            <div className="m-progress-bar" style={{ height: 10 }}>
              <div className="m-progress-fill" style={{
                width: `${productivity(qty, selectedOrder.qty_ordered)}%`,
                background: qty >= selectedOrder.qty_ordered ? 'var(--m-green)' : 'var(--m-green3)',
              }} />
            </div>
          </div>

          {/* Stepper */}
          <div className="m-label">Units Packed</div>
          <div className="m-stepper" style={{ marginBottom: 14 }}>
            <button className="m-stepper-btn" onClick={() => stepQty(-10)} style={{ borderRight: '1px solid var(--m-border)' }}>−10</button>
            <button className="m-stepper-btn" onClick={() => stepQty(-1)} style={{ borderRight: '1px solid var(--m-border)', fontSize: 28 }}>−</button>
            <div className="m-stepper-val">{qty}</div>
            <button className="m-stepper-btn" onClick={() => stepQty(1)} style={{ borderLeft: '1px solid var(--m-border)', fontSize: 28 }}>+</button>
            <button className="m-stepper-btn" onClick={() => stepQty(10)} style={{ borderLeft: '1px solid var(--m-border)' }}>+10</button>
          </div>

          {/* Quick set */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                className="m-btn m-btn-secondary"
                style={{ padding: '12px 4px', fontSize: 14 }}
                onClick={() => setQty(Math.round(selectedOrder.qty_ordered * pct / 100))}
              >
                {pct}%
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="m-btn m-btn-primary" style={{ flex: 1 }} onClick={handleUpdateQty} disabled={updating}>
              {updating ? 'Saving...' : 'Save Progress'}
            </button>
            {qty >= selectedOrder.qty_ordered && (
              <button className="m-btn m-btn-outline" onClick={() => handleMarkDone(selectedOrder)} style={{ whiteSpace: 'nowrap' }}>
                ✓ Mark Done
              </button>
            )}
          </div>
        </BottomSheet>
      )}
    </div>
  )
}
