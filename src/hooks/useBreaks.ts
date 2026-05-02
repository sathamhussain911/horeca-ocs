import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { BreakLog, BreakFormData, Team } from '../types'
import { differenceInMinutes, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

export function useBreaks() {
  const [breaks, setBreaks] = useState<BreakLog[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBreaks = useCallback(async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch teams for name resolution
    const { data: teamsData } = await supabase.from('teams').select('*')
    if (teamsData) setTeams(teamsData)

    const { data, error } = await supabase
      .from('break_logs')
      .select('*, teams(id, name, color)')
      .gte('created_at', today.toISOString())
      .order('check_out', { ascending: false })

    if (error) {
      toast.error('Failed to load break logs')
      console.error(error)
    } else {
      setBreaks(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchBreaks()

    const channel = supabase
      .channel('breaks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'break_logs' }, () => {
        fetchBreaks()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchBreaks])

  const checkOut = async (data: BreakFormData): Promise<boolean> => {
    const teamName = teams.find((t) => t.id === data.team_id)?.name || ''
    const { error } = await supabase.from('break_logs').insert({
      employee_name: data.employee_name,
      employee_ref: data.employee_ref,
      team_id: data.team_id || null,
      team_name: teamName,
      reason: data.reason,
      check_out: new Date().toISOString(),
      shift: 'Day',
      notes: data.notes || null,
    })

    if (error) {
      toast.error('Failed to log check-out')
      console.error(error)
      return false
    }
    toast.success(`${data.employee_name} checked out`)
    return true
  }

  const checkIn = async (breakId: string): Promise<boolean> => {
    const breakLog = breaks.find((b) => b.id === breakId)
    if (!breakLog) return false

    const now = new Date()
    const duration = differenceInMinutes(now, parseISO(breakLog.check_out))

    const { error } = await supabase
      .from('break_logs')
      .update({
        check_in: now.toISOString(),
        duration_minutes: duration,
      })
      .eq('id', breakId)

    if (error) {
      toast.error('Failed to log check-in')
      console.error(error)
      return false
    }
    toast.success(`${breakLog.employee_name} checked back in · ${duration}m break`)
    return true
  }

  const activeBreaks = breaks.filter((b) => !b.check_in)
  const completedBreaks = breaks.filter((b) => b.check_in)
  const avgDuration =
    completedBreaks.length > 0
      ? Math.round(
          completedBreaks.reduce((s, b) => s + (b.duration_minutes || 0), 0) /
            completedBreaks.length
        )
      : 0

  return {
    breaks,
    activeBreaks,
    completedBreaks,
    avgDuration,
    loading,
    checkOut,
    checkIn,
    refetch: fetchBreaks,
  }
}
