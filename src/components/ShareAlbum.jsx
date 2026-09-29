import { WEDDING } from '../config.js'
import Reveal from './Reveal.jsx'
import qrImg from '../assets/QR_album.png'
import './ShareAlbum.css'

const STEPS = [
  'Escanea el código o toca "Subir mis fotos"',
  'Toca el icono "+" o "Agregar fotos"',
  'Elige tus fotos y videos del día. ¡Listo, ya son parte del álbum!',
]

export default function ShareAlbum() {
  return (
    <>
      <Reveal>
        <h2 className="section-title">Compartimos este día junto a ti</h2>
        <p className="album-sub">
          Queremos ver este día a través de tus ojos: comparte tus fotos y
          videos en nuestro álbum
        </p>
      </Reveal>

      <Reveal delay={150}>
        <img
          className="album-qr"
          src={qrImg}
          alt="Código QR del álbum compartido"
        />
        <p className="album-scan">Escanéalo con la cámara de tu celular</p>
      </Reveal>

      <Reveal delay={250}>
        <a
          className="rsvp-btn"
          href={WEDDING.albumUrl}
          target="_blank"
          rel="noreferrer"
        >
          Subir mis fotos
        </a>
      </Reveal>

      <Reveal delay={350}>
        <ol className="album-steps">
          {STEPS.map((step, i) => (
            <li key={step}>
              <span className="step-num">{i + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </>
  )
}
