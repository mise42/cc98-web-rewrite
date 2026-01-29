import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CollapsibleContentProps {
  children: React.ReactNode
  threshold?: number // 高度阈值，默认200px
}

export const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  children,
  threshold = 200,
}) => {
  const [isCollapsible, setIsCollapsible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const contentWrapperRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // 测量内容高度
  const measureHeight = useCallback(() => {
    if (contentWrapperRef.current) {
      const height = contentWrapperRef.current.scrollHeight
      setIsCollapsible(height > threshold)
    }
  }, [threshold])

  // 使用 ref callback 确保 DOM 元素可用时立即测量
  const setContentWrapperRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentWrapperRef.current = node

      if (node) {
        // 延迟测量以确保内容完全渲染
        setTimeout(measureHeight, 50)

        // 设置 ResizeObserver
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect()
        }

        resizeObserverRef.current = new ResizeObserver(() => {
          measureHeight()
        })
        resizeObserverRef.current.observe(node)
      }
    },
    [measureHeight]
  )

  // 清理
  useEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [])

  return (
    <div>
      <div
        ref={contentRef}
        style={{
          maxHeight: isCollapsible && !isExpanded ? `${threshold}px` : 'none',
          overflow: isCollapsible && !isExpanded ? 'hidden' : 'visible',
          transition: 'max-height 0.3s ease',
        }}
        className={isCollapsible && !isExpanded ? 'masked-content' : ''}
      >
        <div ref={setContentWrapperRef}>{children}</div>
      </div>

      {isCollapsible && (
        <div className="mt-2 flex justify-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-muted-foreground hover:text-primary h-7 px-2"
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                收起引用
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                展开完整引用
              </>
            )}
          </Button>
        </div>
      )}

      <style>{`
        .masked-content {
          mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
        }
      `}</style>
    </div>
  )
}
