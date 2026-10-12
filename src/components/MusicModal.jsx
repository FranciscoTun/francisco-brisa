import { useState } from 'react'
import { postSong } from '../api.js'
import { useModalClose } from '../hooks/useModalClose.js'
import './Modal.css'
import './MusicModal.css'

export default function MusicModal({ onClose }) {
  const [name, setName] = useState('')
  const [song, setSong] = useState('')
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useModalClose(onClose)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await postSong({ name, song, link: link || null })
      setSent(true)
      setTimeout(onClose, 1600)
    } catch {
      setError('No se pudo enviar. Inténtalo de nuevo.')
      setBusy(false)
    }
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
        {sent ? (
          <p className="music-thanks">¡Gracias por tu sugerencia!</p>
        ) : (
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
          {error && <p className="music-error">{error}</p>}
          <button type="submit" className="modal-submit" disabled={busy}>
            {busy ? 'Enviando…' : 'Enviar sugerencia'}
          </button>
        </form>
        )}
      </div>
    </div>
  )
}
