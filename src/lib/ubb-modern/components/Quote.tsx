import React from 'react'
import { CollapsibleContent } from '@/components/ui/CollapsibleContent'

export const Quote: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <CollapsibleContent threshold={200}>
      <blockquote className="border-l-4 border-primary/30 bg-muted/30 pl-4 py-2 my-4 italic text-muted-foreground rounded-r">
        {children}
      </blockquote>
    </CollapsibleContent>
  )
}
