interface DateDisplayProps {
  date: string
}

export function DateDisplay({ date }: DateDisplayProps) {
  return (
    <>
      <span className="text-blue-400 dark:text-blue-300 font-semibold">[{date}]</span>{' '}
    </>
  )
}
