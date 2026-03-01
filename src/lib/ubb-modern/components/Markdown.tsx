import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CollapsibleContent } from '@/components/ui/CollapsibleContent'

export const Markdown: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const content = React.Children.toArray(children)
    .map(child => (typeof child === 'string' || typeof child === 'number' ? String(child) : ''))
    .join('')

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none my-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 自定义 blockquote 渲染器，添加折叠功能
          blockquote: ({ children }) => (
            <CollapsibleContent threshold={200} previewLines={3}>
              <blockquote>{children}</blockquote>
            </CollapsibleContent>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
