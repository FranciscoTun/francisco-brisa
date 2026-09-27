import { useState } from 'react'
import { WEDDING } from '../config.js'
import { useModalClose } from '../hooks/useModalClose.js'
import { BankIcon, EnvelopeIcon, GiftIcon } from './icons.jsx'
import './Modal.css'
import './GiftsModal.css'

export default function GiftsModal({ onClose }) {
  useModalClose(onClose)
  const [copied, setCopied] = useState(null)
  const g = WEDDING.gifts

  const copy = async (value) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      /* el portapapeles puede no estar disponible */
    }
    setCopied(value)
    setTimeout(() => setCopied(null), 1600)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal gifts-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gifts-modal-title"
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
          <GiftIcon />
        </div>
        <h3 id="gifts-modal-title" className="dress-modal-title">
          Regalos
        </h3>
        <p className="gifts-modal-intro">{g.intro}</p>

        <div className="gift-card">
          <div className="gift-card-icon">
            <EnvelopeIcon />
          </div>
          <div>
            <h4>Lluvia de sobres</h4>
            <p>{g.envelopeText}</p>
          </div>
        </div>

        <div className="gift-card">
          <div className="gift-card-icon">
            <BankIcon />
          </div>
          <div className="gift-card-body">
            <h4>Transferencia</h4>
            <p className="gift-bank">
              {g.bank} · {g.holder}
            </p>
            {g.methods.map((m) => (
              <div className="copy-row" key={m.label}>
                <span className="copy-label">{m.label}</span>
                <code className="copy-value">{m.value}</code>
                <button
                  type="button"
                  className={`copy-btn ${copied === m.value ? 'copied' : ''}`}
                  onClick={() => copy(m.value)}
                >
                  {copied === m.value ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <p className="gifts-thanks">¡Gracias por ser parte de nuestra historia!</p>
      </div>
    </div>
  )
}
