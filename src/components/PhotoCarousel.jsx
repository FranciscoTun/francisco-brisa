import { useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './icons.jsx'
import './PhotoCarousel.css'

export default function PhotoCarousel({ photos, onZoom }) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState(() =>
    matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'idle'
      : 'pre',
  )
  const [replay, setReplay] = useState(0)
  const [portrait, setPortrait] = useState(
    () => matchMedia('(orientation: portrait)').matches,
  )
  const touchX = useRef(0)
  const wrapRef = useRef(null)
  const idleT = useRef(null)
  const n = photos.length

  useEffect(() => {
    const mq = matchMedia('(orientation: portrait)')
    const fn = () => setPortrait(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  const startIntro = () => {
    clearTimeout(idleT.current)
    setReplay((r) => r + 1)
    setPhase('fan')
    idleT.current = setTimeout(() => setPhase('idle'), 3100)
  }

  useEffect(() => {
    const el = wrapRef.current
    if (!el || n === 0) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        startIntro()
        io.disconnect()
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      clearTimeout(idleT.current)
    }
  }, [n])

  // En vertical las tarjetas van más juntas (pero asomando los bordes)
  const gap = portrait ? 92 : 112

  if (n === 0) return null

  const go = (dir) =>
    phase === 'idle' && setIndex((i) => (i + dir + n) % n)

  const slideStyle = (i, off, abs) => {
    const sc = abs === 0 ? 1 : abs === 1 ? 0.8 : 0.62
    if (phase === 'pre')
      return { opacity: 0, zIndex: i, pointerEvents: 'none' }
    if (phase === 'fan') {
      const tx = off * gap
      return {
        '--rj': `${((i % 5) - 2) * 1.6}deg`,
        '--tx': `${tx}%`,
        '--txm': `${tx * 0.42}%`,
        '--ty': `${-50 - 80 * (1 - sc)}%`,
        '--tym': `${-50 - 80 * (1 - sc * 0.42)}%`,
        '--sc': sc,
        '--scm': sc * 0.42,
        '--op': abs === 0 ? 1 : abs === 1 ? 0.55 : abs === 2 ? 0.26 : 0,
        animation: 'pc-fan-in 3s cubic-bezier(0.25, 0.8, 0.3, 1) both',
        opacity: 0,
        zIndex: i,
        pointerEvents: 'none',
      }
    }
    return {
      transform: `translate(-50%, ${-50 - 80 * (1 - sc)}%) translateX(${
        off * gap
      }%) rotate(0deg) scale(${sc})`,
      opacity: abs === 0 ? 1 : abs === 1 ? 0.55 : abs === 2 ? 0.26 : 0,
      zIndex: 30 - abs,
      pointerEvents: abs > 2 || phase !== 'idle' ? 'none' : 'auto',
    }
  }

  return (
    <div className="carousel-wrap" ref={wrapRef}>
      <div
        className="carousel"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchX.current
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
        }}
      >
        {photos.map((src, i) => {
          let off = i - index
          if (off > n / 2) off -= n
          if (off < -n / 2) off += n
          const abs = Math.abs(off)
          return (
            <button
              type="button"
              key={`${replay}-${src}`}
              className="carousel-slide"
              style={slideStyle(i, off, abs)}
              onClick={() =>
                phase === 'idle' &&
                (off === 0 ? onZoom?.(src) : setIndex(i))
              }
              aria-label={
                off === 0 ? `Ampliar foto ${i + 1}` : `Ir a foto ${i + 1}`
              }
            >
              <img src={src} alt={`Foto ${i + 1}`} loading="lazy" />
            </button>
          )
        })}
      </div>

      {n > 1 && (
        <div className={`carousel-nav${phase !== 'idle' ? ' hidden' : ''}`}>
          <button
            type="button"
            className="nav-btn"
            onClick={() => go(-1)}
            aria-label="Foto anterior"
          >
            <ChevronLeftIcon />
          </button>
          <span className="carousel-counter">
            {index + 1} / {n}
          </span>
          <button
            type="button"
            className="nav-btn"
            onClick={() => go(1)}
            aria-label="Foto siguiente"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  )
}
