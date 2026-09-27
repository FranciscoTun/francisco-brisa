import { useState } from 'react'
import Envelope from './components/Envelope.jsx'
import Invitation from './pages/Invitation.jsx'

function App() {
  const [opened, setOpened] = useState(false)

  return (
    <>
      {opened && <Invitation />}
      {!opened && <Envelope onDone={() => setOpened(true)} />}
    </>
  )
}

export default App
