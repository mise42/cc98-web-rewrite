import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { List, InfinityIcon } from 'lucide-react'

type ViewMode = 'pagination' | 'infinite'

interface ViewModeToggleProps {
  mode: ViewMode
  onModeChange: (mode: ViewMode) => void
}

const modeOptions: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
  { value: 'pagination', label: '分页浏览', icon: <List className="w-4 h-4" /> },
  { value: 'infinite', label: '无限滚动', icon: <InfinityIcon className="w-4 h-4" /> },
]

export function ViewModeToggle({ mode, onModeChange }: ViewModeToggleProps) {
  return (
    <Select value={mode} onValueChange={onModeChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {modeOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              {option.icon}
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
