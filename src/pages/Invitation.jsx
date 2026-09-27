import { WEDDING } from '../config.js'
import Countdown from '../components/Countdown.jsx'
import Petals from '../components/Petals.jsx'
import Reveal from '../components/Reveal.jsx'
import './Invitation.css'

const photoModules = import.meta.glob(
  '../assets/photos/*.{png,jpg,jpeg,webp,avif}',
  { eager: true, query: '?url', import: 'default' },
)
const photos = Object.values(photoModules)

const dateLabel = new Date(WEDDING.dateISO).toLocaleDateString('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
)

const RingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="14" r="6" />
    <circle cx="15" cy="10" r="6" />
  </svg>
)

function EventCard({ icon, title, place, address, time, mapsUrl, delay }) {
  return (
    <Reveal delay={delay}>
      <article className="info-card">
        <div className="info-icon">{icon}</div>
        <h3 className="info-title">{title}</h3>
        <p className="info-place">{place}</p>
        <p className="info-line">
          <PinIcon /> {address}
        </p>
        <p className="info-line">
          <ClockIcon /> {time}
        </p>
        <a
          className="info-btn"
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
        >
          Cómo llegar
        </a>
      </article>
    </Reveal>
  )
}

export default function Invitation() {
  return (
    <div className="invite">
      <Petals count={16} />

      <header className="hero">
        <Reveal>
          <p className="hero-pre">¡Nos casamos!</p>
        </Reveal>
        <Reveal delay={200}>
          <h1 className="hero-names">
            {WEDDING.him} <span>&amp;</span> {WEDDING.her}
          </h1>
        </Reveal>
        <Reveal delay={400}>
          <div className="divider" />
          <p className="hero-date">{dateLabel}</p>
          <div className="divider" />
        </Reveal>
        <p className="hero-scroll" aria-hidden="true">
          Desliza
        </p>
      </header>

      <section className="section">
        <Reveal>
          <h2 className="section-title">Faltan</h2>
        </Reveal>
        <Reveal delay={150}>
          <Countdown target={WEDDING.dateISO} />
        </Reveal>
      </section>

      <section className="section section-alt">
        <Reveal>
          <h2 className="section-title">Cuándo &amp; Dónde</h2>
        </Reveal>
        <div className="cards">
          <EventCard
            icon={<RingsIcon />}
            title="Ceremonia"
            place={WEDDING.ceremony.place}
            address={WEDDING.ceremony.address}
            time={WEDDING.ceremony.time}
            mapsUrl={WEDDING.ceremony.mapsUrl}
            delay={100}
          />
          <EventCard
            icon={<RingsIcon />}
            title="Recepción"
            place={WEDDING.reception.place}
            address={WEDDING.reception.address}
            time={WEDDING.reception.time}
            mapsUrl={WEDDING.reception.mapsUrl}
            delay={250}
          />
        </div>
      </section>

      <section className="section">
        <Reveal>
          <h2 className="section-title">Nosotros</h2>
        </Reveal>
        {photos.length > 0 ? (
          <div className="gallery">
            {photos.map((src, i) => (
              <Reveal key={src} delay={i * 100}>
                <img className="gallery-img" src={src} alt={`Foto ${i + 1}`} loading="lazy" />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal delay={150}>
            <p className="gallery-empty">
              Próximamente compartiremos nuestras fotos aquí
            </p>
          </Reveal>
        )}
      </section>

      <section className="section section-alt">
        <Reveal>
          <h2 className="section-title">Código de vestimenta</h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="dress-code">{WEDDING.dressCode}</p>
        </Reveal>
      </section>

      <section className="section rsvp">
        <Reveal>
          <h2 className="section-title">Confirma tu asistencia</h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="rsvp-text">
            Nos encantaría contar contigo en este día tan especial.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <a
            className="rsvp-btn"
            href={`https://wa.me/${WEDDING.whatsapp}?text=${encodeURIComponent(
              `¡Hola! Confirmo mi asistencia a la boda de ${WEDDING.him} & ${WEDDING.her} 💍`,
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Confirmar por WhatsApp
          </a>
        </Reveal>
      </section>

      <footer className="footer">
        <p className="footer-names">
          {WEDDING.him} &amp; {WEDDING.her}
        </p>
        <p className="footer-date">{dateLabel}</p>
      </footer>
    </div>
  )
}
