import { useState } from 'react'
import { WEDDING } from '../config.js'
import { useModalClose } from '../hooks/useModalClose.js'
import './Modal.css'
import './MusicModal.css'

export default function MusicModal({ onClose }) {
  const [name, setName] = useState('')
  const [song, setSong] = useState('')
  const [link, setLink] = useState('')

  useModalClose(onClose)

  const submit = (e) => {
    e.preventDefault()
    const text = `🎵 Sugerencia de canción\n\nDe: ${name}\nCanción: ${song}${
      link ? `\nLink: ${link}` : ''
    }`
    window.open(
      `https://wa.me/${WEDDING.whatsapp}?text=${encodeURIComponent(text)}`,
      '_blank',
    )
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="music-modal-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h3 id="music-modal-title" className="modal-title">
          Sugerir canción
        </h3>
        <form onSubmit={submit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
          />
          <input
            value={song}
            onChange={(e) => setSong(e.target.value)}
            placeholder="Nombre de la canción y autor"
            required
          />
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Si lo deseas, ingresa el enlace de YouTube, Spotify, etc. (opcional)"
          />
          <button type="submit" className="modal-submit">
            Enviar sugerencia
          </button>
        </form>
      </div>
    </div>
  )
}
