import { useEffect } from 'react'

export function useModalClose(onClose) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const scroller = document.querySelector('.invite')
    if (scroller) scroller.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      if (scroller) scroller.style.overflow = ''
    }
  }, [onClose])
}
