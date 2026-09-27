import { useEffect, useState } from 'react'
import { CompressIcon, ExpandIcon } from './icons.jsx'

export default function FullscreenButton() {
  const [fs, setFs] = useState(false)

  useEffect(() => {
    const onChange = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const el = document.documentElement
  if (!el.requestFullscreen && !el.webkitRequestFullscreen) return null

  const toggle = () => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      } else {
        const req = el.requestFullscreen || el.webkitRequestFullscreen
        req.call(el)?.catch(() => {})
      }
    } catch {
      /* navegador sin soporte de fullscreen */
    }
  }

  return (
    <button
      type="button"
      className="fs-btn"
      onClick={toggle}
      aria-label={fs ? 'Salir de pantalla completa' : 'Pantalla completa'}
    >
      {fs ? <CompressIcon /> : <ExpandIcon />}
    </button>
  )
}
