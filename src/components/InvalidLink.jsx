import './InvalidLink.css'

// Se muestra cuando la URL no trae un token ?i= válido:
// la invitación no se renderiza en absoluto.
export default function InvalidLink() {
  return (
    <div className="invalid-screen">
      <div className="invalid-card">
        <span className="invalid-monogram">B&amp;F</span>
        <h1 className="invalid-title">Enlace no válido</h1>
        <p className="invalid-text">
          Esta invitación no existe o el enlace está incompleto.
          <br />
          Revisa tu enlace o contacta a los novios.
        </p>
      </div>
    </div>
  )
}
