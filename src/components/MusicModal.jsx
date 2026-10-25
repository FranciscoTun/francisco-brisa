import { useEffect, useState } from 'react'
import { deleteSong, getSongs, postSong, updateSong } from '../api.js'
import { useModalClose } from '../hooks/useModalClose.js'
import './Modal.css'
import './MusicModal.css'

export default function MusicModal({ token, onClose }) {
  const [song, setSong] = useState('')
  const [artist, setArtist] = useState('')
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [songs, setSongs] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [view, setView] = useState('form') // 'form' | 'list'

  useModalClose(onClose)

  const load = async () => {
    try {
      setSongs(await getSongs(token))
    } catch {
      setSongs([])
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clear = () => {
    setSong('')
    setArtist('')
    setLink('')
    setEditingId(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    let url = link.trim()
    if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`
    if (url) {
      try {
        new URL(url)
      } catch {
        setError('El enlace no tiene formato de URL válido')
        return
      }
    }
    setBusy(true)
    setError('')
    try {
      const body = {
        token,
        song: song.trim(),
        artist: artist.trim(),
        link: url || null,
      }
      if (editingId) await updateSong(editingId, body)
      else await postSong(body)
      clear()
      await load()
    } catch {
      setError('No se pudo enviar. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  const startEdit = (s) => {
    setSong(s.song)
    setArtist(s.artist || '')
    setLink(s.link || '')
    setEditingId(s.id)
    setError('')
    setView('form')
  }

  const remove = async (id) => {
    try {
      await deleteSong(id, token)
      if (editingId === id) clear()
      await load()
    } catch {
      setError('No se pudo eliminar. Inténtalo de nuevo.')
    }
  }

  const mine = (songs || []).filter((s) => s.mine)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal music-modal"
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

        <div className="music-views">
          <div
            className="music-track"
            style={{
              transform:
                view === 'list' ? 'translateX(-50%)' : 'translateX(0)',
            }}
          >
            {/* ── Vista: formulario ── */}
            <div className="music-pane">
              <h3 id="music-modal-title" className="modal-title">
                {editingId ? 'Editar canción' : 'Sugerir canción'}
              </h3>
              <form onSubmit={submit}>
                <input
                  value={song}
                  onChange={(e) => setSong(e.target.value)}
                  placeholder="Nombre de la canción"
                  required
                />
                <input
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Artista"
                  required
                />
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Enlace (opcional): YouTube, Spotify…"
                  inputMode="url"
                />
                {error && <p className="music-error">{error}</p>}
                <div className="music-actions">
                  <button
                    type="submit"
                    className="modal-submit"
                    disabled={busy}
                  >
                    {busy
                      ? 'Guardando…'
                      : editingId
                        ? 'Guardar cambios'
                        : 'Enviar sugerencia'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="music-cancel"
                      onClick={clear}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
              {mine.length > 0 && (
                <button
                  type="button"
                  className="music-see"
                  onClick={() => setView('list')}
                >
                  Ver mis canciones sugeridas ({mine.length})
                </button>
              )}
            </div>

            {/* ── Vista: mis canciones ── */}
            <div className="music-pane">
              <button
                type="button"
                className="music-back"
                onClick={() => {
                  setView('form')
                  if (editingId) clear()
                }}
              >
                ← Regresar
              </button>
              <h3 className="modal-title">Mis canciones</h3>
              <ul className="music-list">
                {mine.map((s) => (
                  <li key={s.id} className="music-row mine">
                    <span className="music-row-txt">
                      <b>{s.song}</b>
                      <span className="music-row-sub">{s.artist}</span>
                    </span>
                    <span className="music-row-btns">
                      {s.link && (
                        <a
                          href={s.link}
                          target="_blank"
                          rel="noreferrer"
                          className="music-ic"
                          title="Abrir enlace"
                        >
                          ↗
                        </a>
                      )}
                      <button
                        type="button"
                        className="music-ic"
                        onClick={() => startEdit(s)}
                        title="Editar"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="music-ic danger"
                        onClick={() => remove(s.id)}
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </span>
                  </li>
                ))}
                {mine.length === 0 && (
                  <li className="music-empty">
                    Aún no has sugerido canciones
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
