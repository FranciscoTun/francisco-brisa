import { useState } from 'react'
import { music } from '../audio.js'
import { MuteIcon, SpeakerIcon } from './icons.jsx'

export default function MuteButton() {
  const [muted, setMuted] = useState(music.muted)

  const toggle = () => {
    const next = !muted
    music.muted = next
    if (!next && music.paused) music.play().catch(() => {})
    setMuted(next)
  }

  return (
    <button
      type="button"
      className="fs-btn music-ctl"
      onClick={toggle}
      aria-label={muted ? 'Activar música' : 'Silenciar música'}
    >
      {muted ? <MuteIcon /> : <SpeakerIcon />}
    </button>
  )
}
