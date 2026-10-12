import { useEffect, useState } from 'react'
import Envelope from './components/Envelope.jsx'
import Loader from './components/Loader.jsx'
import InvalidLink from './components/InvalidLink.jsx'
import Admin from './pages/Admin.jsx'
import Invitation from './pages/Invitation.jsx'
import { music } from './audio.js'
import { getInvitation } from './api.js'
import videoPortrait from './assets/videos/video_background_portrait.mp4?url'
import videoLandscape from './assets/videos/video_background_landscape.mp4?url'

const photos = Object.values(
  import.meta.glob('./assets/photos/*.{png,jpg,jpeg,webp}', { eager: true }),
).map((m) => m.default)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function App() {
  // Ruta oculta: /admin solo se abre con la URL exacta
  const base = import.meta.env.BASE_URL || '/'
  const route = location.pathname.slice(base.length).replace(/\/$/, '')
  if (route === 'admin') return <Admin />
  const token = new URLSearchParams(location.search).get('i')
  return <InviteFlow token={token} />
}

function InviteFlow({ token }) {
  // Sin token la invitación ni siquiera se muestra
  const [phase, setPhase] = useState(token ? 'loading' : 'invalid')
  const [opened, setOpened] = useState(false)
  const [progress, setProgress] = useState(0)
  const [inv, setInv] = useState(null)
  const [invalid, setInvalid] = useState(!token)

  useEffect(() => {
    if (!token) return
    const tasks = []

    document.fonts.load('400 80px "Great Vibes"')
    document.fonts.load('500 16px "Cormorant Garamond"')
    document.fonts.load('400 14px Jost')
    tasks.push(document.fonts.ready)

    // Valida la invitación contra el API
    tasks.push(
      getInvitation(token).then(setInv).catch(() => setInvalid(true)),
    )

    tasks.push(
      new Promise((res) => {
        const v = document.createElement('video')
        v.muted = true
        v.preload = 'auto'
        v.oncanplaythrough = res
        v.onerror = res
        v.src = matchMedia('(orientation: portrait)').matches
          ? videoPortrait
          : videoLandscape
      }),
    )

    // Canción de fondo
    tasks.push(
      new Promise((res) => {
        if (music.readyState >= 3) return res()
        music.addEventListener('canplaythrough', res, { once: true })
        music.addEventListener('error', res, { once: true })
      }),
    )

    photos.forEach((src) => {
      tasks.push(
        new Promise((res) => {
          const img = new Image()
          img.onload = img.onerror = res
          img.src = src
        }),
      )
    })

    const total = tasks.length
    let done = 0
    const tracked = tasks.map((p) =>
      Promise.resolve(p).then(() => setProgress(++done / total)),
    )

    Promise.race([
      Promise.all(tracked).then(() => sleep(600)),
      sleep(9000),
    ]).then(() => setPhase('leaving'))
  }, [token])

  useEffect(() => {
    if (phase !== 'leaving') return
    // Token inválido (o API caída) → mensaje, no sobre
    if (invalid || !inv) {
      setPhase('invalid')
      return
    }
    const t = setTimeout(() => setPhase('envelope'), 650)
    return () => clearTimeout(t)
  }, [phase, invalid, inv])

  if (phase === 'invalid') return <InvalidLink />

  if (phase === 'loading' || phase === 'leaving')
    return <Loader progress={progress} leaving={phase === 'leaving'} />

  return opened ? (
    <Invitation inv={inv} onUpdate={setInv} />
  ) : (
    <Envelope onDone={() => setOpened(true)} name={inv.name} />
  )
}

export default App
