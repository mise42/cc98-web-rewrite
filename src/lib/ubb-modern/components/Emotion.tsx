interface EmotionProps {
  emotionId: string
  baseUrl: string
}

export function Emotion({ emotionId, baseUrl }: EmotionProps) {
  const num = parseInt(emotionId, 10)
  if (isNaN(num) || num < 0 || num > 91) {
    console.warn(`Invalid emoticonId: ${emotionId}`)
    return <span>[em{emotionId}]</span>
  }

  const url = `${baseUrl}/static/images/em/em${emotionId}.gif`

  return (
    <img src={url} alt={`em${emotionId}`} className="inline-block align-middle" loading="lazy" />
  )
}

interface AcProps {
  acId: string
  baseUrl: string
}

export function Ac({ acId, baseUrl }: AcProps) {
  const num = parseInt(acId, 10)
  const isValid =
    (num >= 1 && num <= 54) || (num >= 1001 && num <= 1040) || (num >= 2001 && num <= 2055)

  if (!isValid) {
    console.warn(`Invalid acId: ${acId}`)
    return <span>[ac{acId}]</span>
  }

  const url = `${baseUrl}/static/images/ac/${acId}.png`

  return <img src={url} alt={`ac${acId}`} className="inline-block align-middle" loading="lazy" />
}

interface MahjongProps {
  type: 'a' | 'c' | 'f'
  mahjongId: string
  baseUrl: string
}

export function Mahjong({ type, mahjongId, baseUrl }: MahjongProps) {
  const num = parseInt(mahjongId, 10)
  let isValid = false

  if (type === 'a' && num >= 1 && num <= 16) {
    isValid = true
  } else if (type === 'c') {
    const validIds = [3, 18, 19, 46, 49, 59, 96, 134, 189, 217]
    if (validIds.includes(num)) {
      isValid = true
    }
  } else if (type === 'f' && num >= 1 && num <= 208) {
    isValid = true
  }

  if (!isValid) {
    console.warn(`Invalid mahjongId: ${type}:${mahjongId}`)
    return (
      <span>
        [{type}:{mahjongId}]
      </span>
    )
  }

  let url = ''
  const animatedIds: Record<string, boolean> = {
    '004': true,
    '009': true,
    '056': true,
    '061': true,
    '062': true,
    '087': true,
    '115': true,
    '120': true,
    '137': true,
    '168': true,
    '169': true,
    '175': true,
    '206': true,
  }

  if (type === 'a') {
    url = `${baseUrl}/static/images/mahjong/animal2017/${mahjongId}.png`
  } else if (type === 'c') {
    const ext = ['018', '049', '096'].includes(mahjongId) ? 'gif' : 'png'
    url = `${baseUrl}/static/images/mahjong/carton2017/${mahjongId}.${ext}`
  } else if (type === 'f') {
    const ext = animatedIds[mahjongId] ? 'gif' : 'png'
    url = `${baseUrl}/static/images/mahjong/face2017/${mahjongId}.${ext}`
  }

  return (
    <img
      src={url}
      alt={`${type}:${mahjongId}`}
      className="inline-block align-middle"
      loading="lazy"
    />
  )
}
