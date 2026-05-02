import { useState, useEffect } from 'react'

export function MobileClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(i)
  }, [])
  return (
    <span className="m-clock">
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
    </span>
  )
}
