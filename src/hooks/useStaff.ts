import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Staff } from '../types'
import toast from 'react-hot-toast'

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*, teams(id, name, color)')
        .eq('is_active', true)
        .order('name')

      if (error) {
        toast.error('Failed to load staff')
      } else {
        setStaff(data || [])
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { staff, loading }
}
