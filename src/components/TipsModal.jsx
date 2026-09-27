import { WEDDING } from '../config.js'
import { useModalClose } from '../hooks/useModalClose.js'
import { ClipboardIcon } from './icons.jsx'
import './Modal.css'
import './TipsModal.css'

export default function TipsModal({ onClose }) {
  useModalClose(onClose)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal tips-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tips-modal-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="tips-modal-icon">
          <ClipboardIcon />
        </div>
        <h3 id="tips-modal-title" className="dress-modal-title">
          Tips y Notas
        </h3>

        <ul className="tips-list">
          {WEDDING.tips.map((tip) => (
            <li key={tip.title}>
              <h4>{tip.title}</h4>
              <p>{tip.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
