import { useEffect, useState } from 'react'
import Envelope from './components/Envelope.jsx'
import Loader from './components/Loader.jsx'
import Invitation from './pages/Invitation.jsx'
import videoUrl from './assets/videos/video_background.mp4?url'

const photos = Object.values(
  import.meta.glob('./assets/photos/*.{png,jpg,jpeg,webp}', { eager: true }),
).map((m) => m.default)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function App() {
  const [phase, setPhase] = useState('loading')
  const [opened, setOpened] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const tasks = []

    document.fonts.load('400 80px "Great Vibes"')
    document.fonts.load('500 16px "Cormorant Garamond"')
    document.fonts.load('400 14px Jost')
    tasks.push(document.fonts.ready)

    tasks.push(
      new Promise((res) => {
        const v = document.createElement('video')
        v.muted = true
        v.preload = 'auto'
        v.oncanplaythrough = res
        v.onerror = res
        v.src = videoUrl
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
  }, [])

  useEffect(() => {
    if (phase !== 'leaving') return
    const t = setTimeout(() => setPhase('envelope'), 650)
    return () => clearTimeout(t)
  }, [phase])

  if (phase === 'loading' || phase === 'leaving')
    return <Loader progress={progress} leaving={phase === 'leaving'} />

  return opened ? (
    <Invitation />
  ) : (
    <Envelope onDone={() => setOpened(true)} />
  )
}

export default App
