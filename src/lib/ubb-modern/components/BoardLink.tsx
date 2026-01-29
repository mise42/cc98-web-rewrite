import React from 'react'
import Link from 'next/link'
import { Layout } from 'lucide-react'

interface BoardLinkProps {
  children?: React.ReactNode
  boardId?: string
}

export const BoardLink: React.FC<BoardLinkProps> = ({ children, boardId }) => {
  const id = boardId || (typeof children === 'string' ? children : '')

  return (
    <Link
      href={`/board/${id}`}
      className="inline-flex items-center gap-1 text-primary hover:underline"
    >
      <Layout className="w-3 h-3" />
      {children || `Board ${id}`}
    </Link>
  )
}
