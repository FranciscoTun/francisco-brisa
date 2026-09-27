import { useMemo } from 'react'
import './Petals.css'

const COLORS = [
  ['#eec9c9', '#d49a9c'],
  ['#cdd8c3', '#9db48c'],
  ['#e8d6ae', '#c8a55f'],
  ['#e5c2c6', '#c08b91'],
]

export default function Petals({ count = 18 }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        fallDuration: 9 + Math.random() * 9,
        fallDelay: -Math.random() * 18,
        swayDuration: 2.4 + Math.random() * 2.4,
        size: 9 + Math.random() * 13,
        color: COLORS[i % COLORS.length],
        opacity: 0.45 + Math.random() * 0.4,
      })),
    [count],
  )

  return (
    <div className="petals" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal-outer"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.fallDuration}s`,
            animationDelay: `${p.fallDelay}s`,
          }}
        >
          <span
            className="petal-inner"
            style={{
              width: p.size,
              height: p.size * 1.25,
              background: `linear-gradient(135deg, ${p.color[0]}, ${p.color[1]})`,
              opacity: p.opacity,
              animationDuration: `${p.swayDuration}s`,
            }}
          />
        </span>
      ))}
    </div>
  )
}
