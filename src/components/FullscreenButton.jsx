import { useEffect, useState } from 'react'
import { CompressIcon, ExpandIcon } from './icons.jsx'

export default function FullscreenButton() {
  const [fs, setFs] = useState(
    () => !!(document.fullscreenElement || document.webkitFullscreenElement),
  )

  useEffect(() => {
    const onChange = () =>
      setFs(!!(document.fullscreenElement || document.webkitFullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  const el = document.documentElement
  if (!el.requestFullscreen && !el.webkitRequestFullscreen) return null

  const toggle = () => {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        ;(document.exitFullscreen || document.webkitExitFullscreen)
          ?.call(document)
          ?.catch?.(() => {})
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
