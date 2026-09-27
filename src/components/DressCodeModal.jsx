import { WEDDING } from '../config.js'
import { useModalClose } from '../hooks/useModalClose.js'
import { DressIcon, SuitIcon } from './icons.jsx'
import './Modal.css'
import './DressCodeModal.css'

export default function DressCodeModal({ onClose }) {
  useModalClose(onClose)
  const dc = WEDDING.dressCode

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal dress-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dress-modal-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <h3 id="dress-modal-title" className="dress-modal-title">
          Dress Code
        </h3>
        <p className="dress-pill">{dc.label}</p>

        <div className="dress-cols">
          <div className="dress-col">
            <div className="dress-col-icon">
              <DressIcon />
            </div>
            <h4>Ellas</h4>
            <p>{dc.ellas}</p>
          </div>
          <div className="dress-col">
            <div className="dress-col-icon">
              <SuitIcon />
            </div>
            <h4>Ellos</h4>
            <p>{dc.ellos}</p>
          </div>
        </div>

        <p className="swatches-title">Colores reservados</p>
        <div className="swatches">
          {dc.reserved.map(([label, color]) => (
            <div className="swatch" key={label}>
              <span
                className="swatch-dot swatch-reserved"
                style={{ background: color }}
              />
              <span className="swatch-label">{label}</span>
            </div>
          ))}
        </div>

        {dc.pinterestUrl && (
          <a
            className="pinterest-link"
            href={dc.pinterestUrl}
            target="_blank"
            rel="noreferrer"
          >
            Más ideas en Pinterest →
          </a>
        )}
      </div>
    </div>
  )
}
