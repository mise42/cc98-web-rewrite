import presetReact from '@bbob/preset-react'
import { BiliPlayer } from '../components/BiliPlayer'
import { Upload } from '../components/Upload'
import { UbbImage } from '../components/UbbImage'
import { Markdown } from '../components/Markdown'
import { Quote } from '../components/Quote'
import { Code } from '../components/Code'
import { TopicLink } from '../components/TopicLink'
import { BoardLink } from '../components/BoardLink'
import { UserLink } from '../components/UserLink'
import { Bold, Italic, Underline, Delete, Url, Color, Size, Align } from '../components/Standard'
import { Table, TableRow, TableCell } from '../components/Table'
import { Emotion, Ac, Mahjong, Ms, Tb, Cc98 } from '../components/Emotion'
import { List, ListItem } from '../components/List'
import { Audio, Video } from '../components/Media'
import { Font, HorizontalRule, Cursor } from '../components/Utility'
import { DateDisplay } from '../components/DateDisplay'

export const cc98Preset = () => {
  const reactPresetInstance = presetReact()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any, coreInstance: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tree.walk((node: any) => {
      if (typeof node === 'string') return node

      const tag = node.tag
      const attrs = node.attrs || {}

      switch (tag) {
        case 'date':
          node.tag = DateDisplay
          node.attrs = {
            date: attrs.date || Object.values(attrs)[0],
          }
          break
        case 'br':
          node.tag = 'br'
          break
        case 'bili':
          node.tag = BiliPlayer
          if (attrs.bili) {
            node.attrs = { ...attrs, page: attrs.bili }
            delete node.attrs.bili
          } else {
            const keys = Object.keys(attrs)
            if (keys.length > 0) {
              node.attrs = { ...attrs, page: keys[0] }
            }
          }
          break
        case 'upload':
          node.tag = Upload
          if (attrs.upload) {
            node.attrs = { ...attrs, params: attrs.upload }
            delete node.attrs.upload
          } else {
            const keys = Object.keys(attrs)
            if (keys.length > 0) {
              node.attrs = { ...attrs, params: keys[0] }
            }
          }
          break
        case 'md':
          node.tag = Markdown
          break
        case 'quote':
          node.tag = Quote
          break
        case 'code':
          node.tag = Code
          break
        case 'topic':
          node.tag = TopicLink
          if (attrs.topic) {
            node.attrs = { ...attrs, topicId: attrs.topic }
            delete node.attrs.topic
          }
          break
        case 'board':
          node.tag = BoardLink
          if (attrs.board) {
            node.attrs = { ...attrs, boardId: attrs.board }
            delete node.attrs.board
          }
          break
        case 'user':
          node.tag = UserLink
          break
        case 'b':
          node.tag = Bold
          break
        case 'i':
          node.tag = Italic
          break
        case 'u':
          node.tag = Underline
          break
        case 's':
        case 'del':
          node.tag = Delete
          break
        case 'url':
          node.tag = Url
          if (attrs.url) {
            node.attrs = { ...attrs, href: attrs.url }
            delete node.attrs.url
          } else {
            const keys = Object.keys(attrs)
            if (keys.length > 0) {
              const potentialUrl = keys[0]
              node.attrs = { ...attrs, href: potentialUrl }
            }
          }
          break
        case 'img':
          node.tag = UbbImage
          if (attrs.img === '1') {
            node.attrs = { ...attrs, initialHidden: true }
          }
          break
        case 'color':
          node.tag = Color
          if (!attrs.color) {
            const keys = Object.keys(attrs)
            if (keys.length > 0) {
              node.attrs = { ...attrs, color: keys[0] }
            }
          }
          break
        case 'size':
          node.tag = Size
          if (!attrs.size) {
            const keys = Object.keys(attrs)
            if (keys.length > 0) {
              node.attrs = { ...attrs, size: keys[0] }
            }
          }
          break
        case 'align':
          node.tag = Align
          if (!attrs.align) {
            const keys = Object.keys(attrs)
            if (keys.length > 0) {
              node.attrs = { ...attrs, align: keys[0] }
            }
          }
          break
        case 'left':
          node.tag = Align
          node.attrs = { ...attrs, align: 'left' }
          break
        case 'center':
          node.tag = Align
          node.attrs = { ...attrs, align: 'center' }
          break
        case 'right':
          node.tag = Align
          node.attrs = { ...attrs, align: 'right' }
          break
        case 'table':
          node.tag = Table
          break
        case 'tr':
          node.tag = TableRow
          break
        case 'td':
          node.tag = TableCell
          {
            const keys = Object.keys(attrs)
            if (keys.length >= 2) {
              node.attrs = {
                ...attrs,
                rowspan: parseInt(keys[0]) || 1,
                colspan: parseInt(keys[1]) || 1,
              }
            }
          }
          break
        case 'th':
          node.tag = TableCell
          node.attrs = { ...attrs, isHeader: true }
          break
        case 'list':
        case 'ul':
        case 'ol':
          node.tag = List
          node.attrs = { ...attrs, ordered: tag === 'ol' }
          break
        case 'li':
          node.tag = ListItem
          break
        case 'audio':
        case 'mp3':
          node.tag = Audio
          node.attrs = {
            src: attrs.audio || attrs.mp3 || attrs.src || '',
            title: attrs.title || '',
          }
          break
        case 'video':
          node.tag = Video
          node.attrs = {
            src: attrs.video || attrs.src || '',
            poster: attrs.poster || '',
          }
          break
        case 'font':
          node.tag = Font
          node.attrs = {
            face: attrs.face || attrs.font || '',
            size: attrs.size ? parseInt(attrs.size) : undefined,
            color: attrs.color || '',
          }
          break
        case 'hr':
          node.tag = HorizontalRule
          node.attrs = {
            width: attrs.width || '100%',
            color: attrs.color || '#ccc',
            size: attrs.size ? parseInt(attrs.size) : 1,
          }
          break
        case 'cursor':
          node.tag = Cursor
          node.attrs = {
            type: attrs.type || attrs.cursor || 'pointer',
          }
          break
        case 'em':
          node.tag = Emotion
          node.attrs = {
            emotionId: attrs.id || attrs.em || Object.values(attrs)[0],
            baseUrl: '',
          }
          break
        case 'ac':
          node.tag = Ac
          node.attrs = {
            acId: attrs.id || attrs.ac || Object.values(attrs)[0],
            baseUrl: '',
          }
          break
        case 'mahjong':
          node.tag = Mahjong
          node.attrs = {
            type: attrs.type as 'a' | 'c' | 'f',
            mahjongId: attrs.id,
            baseUrl: '',
          }
          break
        case 'ms':
          node.tag = Ms
          node.attrs = {
            msId: attrs.id || attrs.ms || Object.values(attrs)[0],
            baseUrl: '',
          }
          break
        case 'tb':
          node.tag = Tb
          node.attrs = {
            tbId: attrs.id || attrs.tb || Object.values(attrs)[0],
            baseUrl: '',
          }
          break
        case 'cc98':
        case 'CC98':
          node.tag = Cc98
          node.attrs = {
            cc98Id: attrs.id || attrs.cc98 || attrs.CC98 || Object.values(attrs)[0],
            baseUrl: '',
          }
          break
        default:
          if (tag.startsWith('ac')) {
            const acMatch = tag.match(/^ac(\d+)$/)
            if (acMatch) {
              node.tag = Ac
              node.attrs = { acId: acMatch[1], baseUrl: '' }
            }
          } else if (/^[acf]:\d{3}$/.test(tag)) {
            const mahjongMatch = tag.match(/^([acf]):(\d{3})$/)
            if (mahjongMatch) {
              node.tag = Mahjong
              node.attrs = {
                type: mahjongMatch[1] as 'a' | 'c' | 'f',
                mahjongId: mahjongMatch[2],
                baseUrl: '',
              }
            }
          } else if (tag.match(/^ms\d+$/)) {
            const msMatch = tag.match(/^ms(\d+)$/)
            if (msMatch) {
              node.tag = Ms
              node.attrs = { msId: msMatch[1], baseUrl: '' }
            }
          } else if (tag.match(/^tb\d+$/)) {
            const tbMatch = tag.match(/^tb(\d+)$/)
            if (tbMatch) {
              node.tag = Tb
              node.attrs = { tbId: tbMatch[1], baseUrl: '' }
            }
          } else if (tag.match(/^CC98\d+$/i)) {
            const cc98Match = tag.match(/^CC98(\d+)$/i)
            if (cc98Match) {
              node.tag = Cc98
              node.attrs = { cc98Id: cc98Match[1], baseUrl: '' }
            }
          }
      }

      return node
    })

    return reactPresetInstance(tree, coreInstance)
  }
}
