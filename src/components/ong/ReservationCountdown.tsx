'use client'

import { useState, useEffect } from 'react'

interface Props {
  expiresAt: string
}

export default function ReservationCountdown({ expiresAt }: Props) {
  const [remaining, setRemaining] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    const expiry = new Date(expiresAt).getTime()
    const now = Date.now()
    const diff = Math.max(0, expiry - now)
    setRemaining(diff)
    setTotal(diff)

    const interval = setInterval(() => {
      const remainingMs = Math.max(0, expiry - Date.now())
      setRemaining(remainingMs)
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  const totalDays = Math.ceil(total / (1000 * 60 * 60 * 24))
  const remainingDays = totalDays > 0 ? Math.ceil(remaining / (1000 * 60 * 60 * 24)) : 0
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((remaining / (1000 * 60)) % 60)
  const percent = total > 0 ? (remaining / total) * 100 : 0

  const colorClass =
    percent > 50
      ? 'reservation-countdown--ok'
      : percent > 20
        ? 'reservation-countdown--warn'
        : 'reservation-countdown--danger'

  return (
    <div className={`reservation-countdown ${colorClass}`}>
      <div className="reservation-countdown__bar-wrapper">
        <div
          className="reservation-countdown__bar"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="reservation-countdown__text">
        {remainingDays > 0
          ? `${remainingDays}d ${hours}h ${minutes}m restantes`
          : `${hours}h ${minutes}m restantes`}
      </span>
    </div>
  )
}
