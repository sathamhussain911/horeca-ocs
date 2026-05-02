import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Team } from '../types'
import toast from 'react-hot-toast'

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.from('teams').select('*').order('name')
      if (error) {
        toast.error('Failed to load teams')
      } else {
        setTeams(data || [])
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { teams, loading }
}
