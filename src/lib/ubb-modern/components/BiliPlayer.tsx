import React from 'react'

interface BiliPlayerProps {
  children?: React.ReactNode
  page?: string | number
}

function getBiliPage(url: string): string {
  const paramstr = url.split('?')[1]
  const params = paramstr ? paramstr.split('&') : []
  for (let i = 0; i < params.length; i++) {
    const pair = params[i].split('=')
    if (pair[0] === 'p') {
      return pair[1]
    }
  }
  return '1'
}

export const BiliPlayer: React.FC<BiliPlayerProps> = ({ children, page = 1 }) => {
  const content = React.Children.toArray(children)
    .map(child => {
      if (typeof child === 'string') return child
      if (typeof child === 'number') return String(child)
      return ''
    })
    .join('')
    .trim()

  if (!content) return null

  const partNumber = page || 1
  let src = ''

  const isPureNumber = /^\d+$/.test(content)
  const isBVString = /^BV[A-Za-z0-9]+/.test(content)
  const isUrl =
    /(https?:\/\/)?www.bilibili.com\/video\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/.test(
      content
    )

  if (isPureNumber) {
    src = `https://player.bilibili.com/player.html?aid=${content}&page=${partNumber}&autoplay=0&poster=1`
  } else if (isBVString) {
    src = `https://player.bilibili.com/player.html?bvid=${content}&page=${partNumber}&autoplay=0&poster=1`
  } else if (isUrl) {
    const isAv = /^(https?:\/\/)?www\.bilibili\.com\/video\/av[0-9]+/.test(content)
    const isBV = /^(https?:\/\/)?www\.bilibili\.com\/video\/BV[0-9A-Za-z]+/.test(content)
    const urlPage = getBiliPage(content)

    if (isAv) {
      const av = content.split('bilibili.com/video/av')[1].split('?')[0].split('/')[0]
      src = `https://player.bilibili.com/player.html?aid=${av}&page=${urlPage}&autoplay=0&poster=1`
    } else if (isBV) {
      const BV = content.split('bilibili.com/video/')[1].split('?')[0].split('/')[0]
      src = `https://player.bilibili.com/player.html?bvid=${BV}&page=${urlPage}&autoplay=0&poster=1`
    } else {
      return <>{children}</>
    }
  } else {
    return <>{children}</>
  }

  return (
    <div className="my-4">
      <iframe
        src={src}
        allowFullScreen
        style={{ border: 'none' }}
        width="640"
        height="480"
        scrolling="no"
        className="max-w-full"
      />
    </div>
  )
}
