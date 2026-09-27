import { WEDDING } from '../config.js'
import { useModalClose } from '../hooks/useModalClose.js'
import './Modal.css'
import './PhotoModal.css'

export default function PhotoModal({ src, onClose }) {
  useModalClose(onClose)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <figure
        className="photo-zoom"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Foto ampliada"
      >
        <img src={src} alt="Foto ampliada" />
        <figcaption>
          {WEDDING.him} &amp; {WEDDING.her}
        </figcaption>
      </figure>
      <button
        type="button"
        className="modal-close photo-close"
        onClick={onClose}
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  )
}
