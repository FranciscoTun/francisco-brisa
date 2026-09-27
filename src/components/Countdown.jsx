import { useEffect, useState } from 'react'
import './Countdown.css'

export default function Countdown({ target }) {
  const [diff, setDiff] = useState(() =>
    Math.max(0, new Date(target).getTime() - Date.now()),
  )

  useEffect(() => {
    const id = setInterval(
      () => setDiff(Math.max(0, new Date(target).getTime() - Date.now())),
      1000,
    )
    return () => clearInterval(id)
  }, [target])

  const units = [
    ['Días', Math.floor(diff / 864e5)],
    ['Horas', Math.floor(diff / 36e5) % 24],
    ['Min', Math.floor(diff / 6e4) % 60],
    ['Seg', Math.floor(diff / 1e3) % 60],
  ]

  return (
    <div className="countdown">
      {units.map(([label, value]) => (
        <div className="cd-box" key={label}>
          <span className="cd-num">{String(value).padStart(2, '0')}</span>
          <span className="cd-label">{label}</span>
        </div>
      ))}
    </div>
  )
}
