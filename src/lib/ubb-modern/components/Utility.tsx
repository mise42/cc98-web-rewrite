interface FontProps {
  children: React.ReactNode
  face?: string
  size?: number
  color?: string
}

export function Font({ children, face, size, color }: FontProps) {
  const style: React.CSSProperties = {}

  if (face) {
    style.fontFamily = face
  }

  if (size) {
    style.fontSize = `${size}px`
  }

  if (color) {
    style.color = color
  }

  return <span style={style}>{children}</span>
}

interface HorizontalRuleProps {
  width?: string
  color?: string
  size?: number
}

export function HorizontalRule({ width = '100%', color = '#ccc', size = 1 }: HorizontalRuleProps) {
  return (
    <hr
      style={{
        width,
        borderColor: color,
        borderWidth: size,
        margin: '1rem 0',
      }}
      className="border-t"
    />
  )
}

interface CursorProps {
  children: React.ReactNode
  type?: 'pointer' | 'move' | 'text' | 'wait' | 'help' | 'crosshair'
}

export function Cursor({ children, type = 'pointer' }: CursorProps) {
  return <span style={{ cursor: type }}>{children}</span>
}
