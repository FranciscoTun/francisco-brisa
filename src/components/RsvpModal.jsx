import { useState } from 'react'
import { rsvpInvitation } from '../api.js'
import { useModalClose } from '../hooks/useModalClose.js'
import './Modal.css'
import './RsvpModal.css'

export default function RsvpModal({ inv, onClose, onDone }) {
  const [count, setCount] = useState(inv.attendees || inv.max_guests)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useModalClose(onClose)

  const send = async (attendees) => {
    setBusy(true)
    setError('')
    try {
      onDone(await rsvpInvitation(inv.token, attendees))
      onClose()
    } catch {
      setError('No se pudo enviar tu respuesta. Inténtalo de nuevo.')
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
        aria-labelledby="rsvp-modal-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h3 id="rsvp-modal-title" className="modal-title">
          Confirma tu asistencia
        </h3>
        <p className="rsvp-passes">
          Tienes <strong>{inv.max_guests}</strong>{' '}
          {inv.max_guests === 1 ? 'pase' : 'pases'}
        </p>
        {inv.max_guests > 1 && (
          <>
            <label className="rsvp-label" htmlFor="rsvp-count">
              ¿Cuántos asistirán?
            </label>
            <select
              id="rsvp-count"
              className="rsvp-select"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              disabled={busy}
            >
              {Array.from(
                { length: inv.max_guests },
                (_, i) => inv.max_guests - i,
              ).map((n) => (
                <option key={n} value={n}>
                  {n === inv.max_guests
                    ? `Todos (${n})`
                    : n === 1
                      ? '1 persona'
                      : `${n} personas`}
                </option>
              ))}
            </select>
          </>
        )}
        {inv.confirmed && (
          <p className="rsvp-note">
            {inv.attendees === 0
              ? 'Elegiste: no asistirás.'
              : inv.max_guests === 1
                ? 'Elegiste: sí asistirás.'
                : `Elegiste: asistirán ${inv.attendees}.`}{' '}
            Puedes cambiar tu respuesta.
          </p>
        )}
        {error && <p className="rsvp-error">{error}</p>}
        <button
          type="button"
          className="rsvp-accept"
          onClick={() => send(count)}
          disabled={busy}
        >
          {busy ? 'Enviando…' : 'Aceptar invitación'}
        </button>
        <button
          type="button"
          className="rsvp-decline"
          onClick={() => send(0)}
          disabled={busy}
        >
          No podré asistir
        </button>
      </div>
    </div>
  )
}
