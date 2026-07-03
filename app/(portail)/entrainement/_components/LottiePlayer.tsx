'use client'

import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'

/** Charge un Lottie JSON auto-hébergé et le joue en boucle (respecte prefers-reduced-motion). */
export default function LottiePlayer({ src, alt }: { src: string; alt: string }) {
  const [data, setData] = useState<object | null>(null)

  useEffect(() => {
    let alive = true
    fetch(src)
      .then(r => r.json())
      .then(d => { if (alive) setData(d) })
      .catch(() => {})
    return () => { alive = false }
  }, [src])

  if (!data) {
    return <span aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} />
  }

  const reduce = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  return (
    <Lottie
      animationData={data}
      loop={!reduce}
      autoplay={!reduce}
      aria-label={alt}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
