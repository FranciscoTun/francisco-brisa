import { useEffect, useState } from 'react'
import { getWishlist, releaseGift, reserveGift } from '../api.js'
import { useModalClose } from '../hooks/useModalClose.js'
import { GiftIcon } from './icons.jsx'
import './Modal.css'
import './WishlistModal.css'

export default function WishlistModal({ token, onClose }) {
  const [data, setData] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useModalClose(onClose)

  const load = async () => {
    try {
      setData(await getWishlist(token))
    } catch {
      setError('No se pudo cargar la lista')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const choose = async (item) => {
    setBusyId(item.id)
    setNote('')
    try {
      await reserveGift(item.id, token)
      await load()
    } catch (e) {
      if (e.status === 409) {
        setNote(e.message?.includes('máximo')
          ? 'Ya apartaste el máximo de regalos permitido'
          : 'Alguien más lo acaba de elegir — aquí hay más opciones')
        await load()
      } else {
        setNote('No se pudo apartar. Inténtalo de nuevo.')
      }
    } finally {
      setBusyId(null)
    }
  }

  const release = async (item) => {
    setBusyId(item.id)
    try {
      await releaseGift(item.id, token)
      await load()
    } catch {
      setNote('No se pudo liberar. Inténtalo de nuevo.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal wishlist-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlist-modal-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h3 id="wishlist-modal-title" className="modal-title">
          Lista de deseos
        </h3>
        <p className="wishlist-intro">
          Tu presencia es nuestro mejor regalo. Si además quieres hacernos un
          detalle, aquí van algunas ideas:
        </p>

        {error && <p className="music-error">{error}</p>}
        {note && <p className="wishlist-note">{note}</p>}

        {!data && !error && <p className="wishlist-loading">Cargando…</p>}

        {data && data.items.length === 0 && (
          <p className="wishlist-loading">La lista está por publicarse ✨</p>
        )}

        {data && (
          <div className="wishlist-grid">
            {data.items.map((item) => (
              <div
                key={item.id}
                className={`wish-item ${item.reserved && !item.mine ? 'taken' : ''} ${item.mine ? 'mine' : ''}`}
              >
                {item.image ? (
                  item.link ? (
                    <a
                      className="wish-img-link"
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Ver ${item.name} en tienda`}
                    >
                      <img src={item.image} alt="" loading="lazy" />
                    </a>
                  ) : (
                    <img src={item.image} alt="" loading="lazy" />
                  )
                ) : (
                  <div className="wish-item-icon">
                    <GiftIcon />
                  </div>
                )}
                <span className="wish-name">{item.name}</span>
                {item.link && (
                  <a
                    className="wish-store"
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.source
                      ? `Comprar en ${item.source} ↗`
                      : 'Ver en tienda ↗'}
                  </a>
                )}
                {item.mine ? (
                  <button
                    type="button"
                    className="wish-release"
                    onClick={() => release(item)}
                    disabled={busyId === item.id}
                  >
                    Tu elección ✓ — cambiar
                  </button>
                ) : item.reserved ? (
                  <span className="wish-taken">Ya elegido</span>
                ) : data.selectable ? (
                  <button
                    type="button"
                    className="wish-choose"
                    onClick={() => choose(item)}
                    disabled={busyId === item.id}
                  >
                    {busyId === item.id ? '…' : 'Elegir este'}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
