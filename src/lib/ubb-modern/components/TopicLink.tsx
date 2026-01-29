import React from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'

interface TopicLinkProps {
  children?: React.ReactNode
  topicId?: string
}

export const TopicLink: React.FC<TopicLinkProps> = ({ children, topicId }) => {
  const id = topicId || (typeof children === 'string' ? children : '')

  return (
    <Link
      href={`/topic/${id}`}
      className="inline-flex items-center gap-1 text-primary hover:underline"
    >
      <FileText className="w-3 h-3" />
      {children || `Topic ${id}`}
    </Link>
  )
}
