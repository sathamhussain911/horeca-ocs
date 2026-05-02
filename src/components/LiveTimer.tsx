import { useState, useEffect } from 'react'
import { minutesSince } from '../lib/utils'

interface Props {
  checkOut: string
  warnAfter?: number // minutes, default 15
}

export function LiveTimer({ checkOut, warnAfter = 15 }: Props) {
  const [mins, setMins] = useState(minutesSince(checkOut))

  useEffect(() => {
    const i = setInterval(() => setMins(minutesSince(checkOut)), 15000)
    return () => clearInterval(i)
  }, [checkOut])

  const isWarn = mins >= warnAfter

  return (
    <span
      className={`mono ${isWarn ? 'out-timer-warn' : 'out-timer-ok'}`}
      style={{ fontSize: 12, fontWeight: 500 }}
      title={`${mins} minutes out`}
    >
      {mins}m
    </span>
  )
}
