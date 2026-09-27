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

const SuitIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 2.5 L12 5.5 L15 2.5 L17.2 4.2 L16.4 21 L7.6 21 L6.8 4.2 Z" />
    <path d="M9 2.5 L12 9 L15 2.5" />
    <path d="M12 9 L12 21" />
    <path d="M8.3 10.5 h1.6" />
  </svg>
)

const DressIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 2.5 L9.8 7 C10 8.5 9.2 9.6 8 11 C6.2 13.2 5.5 21 5.5 21 L18.5 21 C18.5 21 17.8 13.2 16 11 C14.8 9.6 14 8.5 14.2 7 L15 2.5" />
    <path d="M9 2.5 C9 4.5 10.4 5.8 12 5.8 C13.6 5.8 15 4.5 15 2.5" />
  </svg>
)

const EnvelopeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="8" y="2" width="8" height="6" rx="0.5" />
    <path d="M9.8 4.2 h4.4" />
    <rect x="3" y="6.5" width="18" height="13.5" rx="2" />
    <path d="M3.5 8.5 L12 14.5 L20.5 8.5" />
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
          <div className="dress-icons">
            <div className="info-icon">
              <SuitIcon />
            </div>
            <div className="info-icon">
              <DressIcon />
            </div>
          </div>
          <p className="dress-code">{WEDDING.dressCode}</p>
        </Reveal>
      </section>

      <section className="section">
        <Reveal>
          <h2 className="section-title">Lluvia de sobres</h2>
        </Reveal>
        <Reveal delay={150}>
          <div className="envelope-card">
            <div className="info-icon">
              <EnvelopeIcon />
            </div>
            <p className="envelope-text">
              Durante la recepción encontrarás sobres disponibles por si deseas
              hacernos un regalo en efectivo. ¡Gracias de corazón!
            </p>
          </div>
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
