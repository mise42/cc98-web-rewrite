import React from 'react'

export const Code: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto my-4 font-mono text-sm">
      <code>{children}</code>
    </pre>
  )
}
