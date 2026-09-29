import './Loader.css'

export default function Loader({ progress, leaving }) {
  return (
    <div className={`loader${leaving ? ' leaving' : ''}`}>
      <h1 className="loader-names">
        F<span>&amp;</span>B
      </h1>
      <div className="loader-line" />
      <div className="loader-bar">
        <div
          className="loader-bar-fill"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <p className="loader-text">Preparando tu invitación</p>
    </div>
  )
}
