import { useEffect, useRef, useState } from 'react'
import Petals from './Petals.jsx'
import { WEDDING } from '../config.js'
import './Envelope.css'

const STEPS = {
  open: [850, 'lift'],
  lift: [2200, 'zoom'],
  zoom: [950, 'done'],
}

export default function Envelope({ onDone }) {
  const [phase, setPhase] = useState('idle')
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (phase === 'done') {
      doneRef.current?.()
      return
    }
    const step = STEPS[phase]
    if (!step) return
    const t = setTimeout(() => setPhase(step[1]), step[0])
    return () => clearTimeout(t)
  }, [phase])

  const open = () => {
    // El tap es un gesto válido: se aprovecha para pedir pantalla completa
    try {
      const el = document.documentElement
      const req = el.requestFullscreen || el.webkitRequestFullscreen
      req?.call(el)?.catch(() => {})
    } catch {
      /* navegador sin soporte de fullscreen */
    }
    setPhase((p) => (p === 'idle' ? 'open' : p))
  }

  return (
    <div
      className={`env-overlay env-${phase}`}
      onClick={open}
      role="button"
      aria-label="Abrir invitación"
    >
      <Petals count={12} />
      <div className="env-scene">
        <div className="envelope">
          <div className="env-back" />
          <div className="env-letter">
            <span className="env-letter-text">
              <em>Nuestra Boda</em>
              <strong>
                {WEDDING.him} &amp; {WEDDING.her}
              </strong>
            </span>
          </div>
          <div className="env-front" />
          <div className="env-flap" />
          <div className="env-seal">
            {WEDDING.him[0]}&amp;{WEDDING.her[0]}
          </div>
        </div>
        <p className="env-hint">Toca el sobre para abrir</p>
      </div>
    </div>
  )
}
