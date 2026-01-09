import { useEffect, useRef } from 'react'

interface AudioProps {
  src: string
  title?: string
}

export function Audio({ src, title }: AudioProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let APlayer: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let player: any

    const initPlayer = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        APlayer = (window as any).APlayer

        if (!APlayer || !containerRef.current) return

        player = new APlayer({
          container: containerRef.current,
          autoplay: false,
          preload: 'metadata',
          theme: '#FADFA3',
          loop: 'all',
          audio: {
            url: encodeURI(src),
            title: title || src,
            author: '',
          },
        })
      } catch (e) {
        console.error('Failed to initialize APlayer:', e)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).APlayer) {
      initPlayer()
    } else {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js'
      script.onload = initPlayer
      document.head.appendChild(script)
    }

    return () => {
      if (player && player.destroy) {
        player.destroy()
      }
    }
  }, [src, title])

  return (
    <div ref={containerRef} className="my-4" style={{ minWidth: '300px', maxWidth: '500px' }} />
  )
}

interface VideoProps {
  src: string
  poster?: string
}

export function Video({ src, poster }: VideoProps) {
  return (
    <div className="my-4">
      <video
        src={src}
        poster={poster}
        controls
        className="max-w-full"
        style={{ maxHeight: '500px' }}
      >
        您的浏览器不支持视频播放
      </video>
    </div>
  )
}
