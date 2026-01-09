import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const Markdown: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const content = React.Children.toArray(children)
    .map(child => (typeof child === 'string' || typeof child === 'number' ? String(child) : ''))
    .join('')

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none my-4">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
