import { createPortal } from 'react-dom'
import FullscreenButton from './FullscreenButton.jsx'
import MuteButton from './MuteButton.jsx'

export default function FloatingControls() {
  return createPortal(
    <>
      <FullscreenButton />
      <MuteButton />
    </>,
    document.body,
  )
}
