import React from 'react'
import { UbbImage } from './UbbImage'
import { FileDown } from 'lucide-react'

interface UploadProps {
  children?: React.ReactNode
  params?: string
}

export const Upload: React.FC<UploadProps> = ({ children, params = '' }) => {
  const url = React.Children.toArray(children)
    .map(child => (typeof child === 'string' || typeof child === 'number' ? String(child) : ''))
    .join('')
    .trim()

  if (!url) return null

  const parts = params.split(',')
  const type = parts[0]?.toLowerCase()
  const display = parts[1]

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(type)
  const initialHidden = display === '1'

  if (isImage) {
    return <UbbImage src={url} alt="upload image" initialHidden={initialHidden} />
  }

  return (
    <a
      href={url}
      className="inline-flex items-center gap-2 text-blue-600 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FileDown className="w-4 h-4" />
      点击下载文件
    </a>
  )
}
