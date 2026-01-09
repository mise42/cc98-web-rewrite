import BBCode from '@bbob/react'
import { cc98Preset } from '@/lib/ubb-modern/presets/cc98'

const plugins = [cc98Preset()]

interface UbbContainerProps {
  content: string
  className?: string
}

export function UbbContainer({ content, className }: UbbContainerProps) {
  if (!content) return null

  let processedContent = content

  processedContent = processedContent.replace(/\[(\d{4}\.\d{2}\.\d{2})\]/g, '[date=$1][/date]')

  processedContent = processedContent.replace(/\[em(\d+)\]/g, '[em id=$1][/em]')

  processedContent = processedContent.replace(/\[ac(\d{2}|\d{4})\]/g, '[ac id=$1][/ac]')

  processedContent = processedContent.replace(
    /\[([acf]):(\d{3})\]/g,
    '[mahjong type=$1 id=$2][/mahjong]'
  )

  return (
    <div className={className} style={{ whiteSpace: 'pre-line' }}>
      <BBCode plugins={plugins}>{processedContent}</BBCode>
    </div>
  )
}
