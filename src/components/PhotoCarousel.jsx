import { useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './icons.jsx'
import './PhotoCarousel.css'

export default function PhotoCarousel({ photos, onZoom }) {
  const [index, setIndex] = useState(0)
  const touchX = useRef(0)
  const n = photos.length

  if (n === 0) return null

  const go = (dir) => setIndex((i) => (i + dir + n) % n)

  return (
    <div className="carousel-wrap">
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
              key={src}
              className="carousel-slide"
              style={{
                transform: `translate(-50%, -50%) translateX(${
                  off * 112
                }%) scale(${abs === 0 ? 1 : abs === 1 ? 0.8 : 0.62})`,
                opacity: abs === 0 ? 1 : abs === 1 ? 0.55 : abs === 2 ? 0.26 : 0,
                zIndex: 30 - abs,
                pointerEvents: abs > 2 ? 'none' : 'auto',
              }}
              onClick={() => (off === 0 ? onZoom?.(src) : setIndex(i))}
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
        <div className="carousel-nav">
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
