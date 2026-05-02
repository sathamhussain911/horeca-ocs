import { useState, useEffect } from 'react'
import { parseISO, differenceInSeconds } from 'date-fns'

interface Props {
  checkOut: string
  className?: string
  style?: React.CSSProperties
}
import React from 'react'

function pad(n: number) { return String(n).padStart(2, '0') }

export function MobileBreakTimer({ checkOut, className, style }: Props) {
  const [secs, setSecs] = useState(0)

  useEffect(() => {
    const calc = () => setSecs(Math.max(0, differenceInSeconds(new Date(), parseISO(checkOut))))
    calc()
    const i = setInterval(calc, 1000)
    return () => clearInterval(i)
  }, [checkOut])

  const m = Math.floor(secs / 60)
  const s = secs % 60
  const isOver = m >= 15

  return (
    <div
      className={className}
      style={{
        fontFamily: "'DM Mono', monospace",
        color: isOver ? '#FF4444' : '#F4C542',
        ...style,
      }}
    >
      {pad(m)}:{pad(s)}
    </div>
  )
}
