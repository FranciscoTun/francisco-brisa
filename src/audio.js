import songUrl from './assets/song_background.mp3?url'

export const music = new Audio(songUrl)
music.loop = true
music.preload = 'auto'

// Entra en fade hasta un volumen ambiental
export function startMusic() {
  music.volume = 0
  music
    .play()
    .then(() => {
      const t = setInterval(() => {
        if (music.volume >= 0.45 || music.paused) return clearInterval(t)
        music.volume = Math.min(0.45, music.volume + 0.02)
      }, 200)
    })
    .catch(() => {})
}
