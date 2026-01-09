import { useState, useCallback, useEffect, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

interface CarouselProps<T = unknown> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  autoPlay?: boolean
  interval?: number
  className?: string
}

export function Carousel<T = unknown>({
  items,
  renderItem,
  autoPlay = false,
  interval = 5000,
  className,
}: CarouselProps<T>) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, skipSnaps: false })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  useEffect(() => {
    if (!autoPlay || !emblaApi || items.length <= 1 || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = setInterval(() => {
      scrollNext()
    }, interval)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [autoPlay, interval, emblaApi, scrollNext, items.length, isPaused])

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  const onMouseEnter = useCallback(() => {
    setIsPaused(true)
  }, [])

  const onMouseLeave = useCallback(() => {
    setIsPaused(false)
  }, [])

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div
      className={className}
      ref={emblaRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ overflow: 'hidden' }}
    >
      <div style={{ display: 'flex' }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              flex: '0 0 100%',
              minWidth: 0,
              maxWidth: '100%',
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full shadow transition-all"
            aria-label="Previous"
          >
            ←
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full shadow transition-all"
            aria-label="Next"
          >
            →
          </button>
        </>
      )}

      {items.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                selectedIndex === index ? 'bg-primary w-6' : 'bg-muted-foreground/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
