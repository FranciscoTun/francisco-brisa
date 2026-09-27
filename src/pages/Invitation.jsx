import { useState } from 'react'
import { WEDDING } from '../config.js'
import Countdown from '../components/Countdown.jsx'
import DressCodeModal from '../components/DressCodeModal.jsx'
import FullscreenButton from '../components/FullscreenButton.jsx'
import GiftsModal from '../components/GiftsModal.jsx'
import MusicModal from '../components/MusicModal.jsx'
import Petals from '../components/Petals.jsx'
import PhotoModal from '../components/PhotoModal.jsx'
import Reveal from '../components/Reveal.jsx'
import TipsModal from '../components/TipsModal.jsx'
import bgVideo from '../assets/videos/video_background.mp4'
import {
  ClipboardIcon,
  ClockIcon,
  DressIcon,
  GiftIcon,
  PinIcon,
  RingsIcon,
  SuitIcon,
} from '../components/icons.jsx'
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
  const [musicOpen, setMusicOpen] = useState(false)
  const [dressOpen, setDressOpen] = useState(false)
  const [tipsOpen, setTipsOpen] = useState(false)
  const [giftsOpen, setGiftsOpen] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(null)

  return (
    <div className="invite">
      <Petals count={16} />

      <header className="hero">
        <video
          className="hero-video"
          src={bgVideo}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="hero-overlay" />
        <FullscreenButton />
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
          <h2 className="section-title">Retratos de nuestro amor</h2>
          <p className="section-subtitle">La clave es disfrutar cada momento</p>
        </Reveal>
        {photos.length > 0 ? (
          <div className="gallery">
            {photos.map((src, i) => (
              <Reveal key={src} delay={i * 100}>
                <button
                  type="button"
                  className="polaroid"
                  onClick={() => setPhotoOpen(src)}
                >
                  <img src={src} alt={`Foto ${i + 1}`} loading="lazy" />
                </button>
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
          <p className="dress-code">{WEDDING.dressCode.label}</p>
          <p className="dress-hint">{WEDDING.dressCode.hint}</p>
          <button
            type="button"
            className="info-btn"
            onClick={() => setDressOpen(true)}
          >
            Ver más
          </button>
        </Reveal>
      </section>

      <section className="section">
        <Reveal>
          <h2 className="section-title">Regalos</h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="gifts-teaser">{WEDDING.gifts.teaser}</p>
          <div className="dress-icons">
            <div className="info-icon">
              <GiftIcon />
            </div>
          </div>
          <button
            type="button"
            className="info-btn"
            onClick={() => setGiftsOpen(true)}
          >
            Ver más
          </button>
        </Reveal>
      </section>

      <section className="section section-alt">
        <Reveal>
          <h2 className="section-title">Música</h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="music-quote">
            ¿Cuál es la canción que no puede faltar en la lista de reproducción
            de la fiesta?
          </p>
        </Reveal>
        <Reveal delay={300}>
          <button
            type="button"
            className="music-btn"
            onClick={() => setMusicOpen(true)}
          >
            Sugerir canción
          </button>
        </Reveal>
      </section>

      <section className="section">
        <Reveal>
          <h2 className="section-title">Tips y notas</h2>
        </Reveal>
        <Reveal delay={150}>
          <div className="dress-icons">
            <div className="info-icon">
              <ClipboardIcon />
            </div>
          </div>
          <p className="dress-hint">Información adicional a considerar</p>
          <button
            type="button"
            className="info-btn"
            onClick={() => setTipsOpen(true)}
          >
            Ver más
          </button>
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

      {musicOpen && <MusicModal onClose={() => setMusicOpen(false)} />}
      {dressOpen && <DressCodeModal onClose={() => setDressOpen(false)} />}
      {tipsOpen && <TipsModal onClose={() => setTipsOpen(false)} />}
      {giftsOpen && <GiftsModal onClose={() => setGiftsOpen(false)} />}
      {photoOpen && (
        <PhotoModal src={photoOpen} onClose={() => setPhotoOpen(null)} />
      )}

      <footer className="footer">
        <p className="footer-names">
          {WEDDING.him} &amp; {WEDDING.her}
        </p>
        <p className="footer-date">{dateLabel}</p>
      </footer>
    </div>
  )
}
