import { clsx } from 'clsx'

interface TableProps {
  children: React.ReactNode
}

export function Table({ children }: TableProps) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-gray-300">{children}</table>
    </div>
  )
}

interface TableRowProps {
  children: React.ReactNode
}

export function TableRow({ children }: TableRowProps) {
  return <tr className="border-b border-gray-300">{children}</tr>
}

interface TableCellProps {
  children: React.ReactNode
  rowspan?: number
  colspan?: number
  isHeader?: boolean
}

export function TableCell({
  children,
  rowspan = 1,
  colspan = 1,
  isHeader = false,
}: TableCellProps) {
  const Tag = isHeader ? 'th' : 'td'

  return (
    <Tag
      rowSpan={rowspan}
      colSpan={colspan}
      className={clsx(
        'border border-gray-300 px-4 py-2 text-left',
        isHeader ? 'bg-gray-100 font-semibold' : 'bg-white'
      )}
    >
      {children}
    </Tag>
  )
}
