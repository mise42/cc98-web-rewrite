import { useTopicViewStore } from '@/stores/topic-view'
import { Button } from '@/components/ui/button'
import { List, ChevronDown } from 'lucide-react'

interface ViewModeToggleProps {
  onModeChange?: (mode: 'pagination' | 'infinite') => void
}

export function ViewModeToggle({ onModeChange }: ViewModeToggleProps) {
  const { viewMode, setViewMode } = useTopicViewStore()

  const handleModeChange = (mode: 'pagination' | 'infinite') => {
    setViewMode(mode)
    onModeChange?.(mode)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">浏览模式：</span>
      <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-lg">
        <Button
          variant={viewMode === 'pagination' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleModeChange('pagination')}
          className="gap-1.5"
        >
          <List className="w-4 h-4" />
          分页
        </Button>
        <Button
          variant={viewMode === 'infinite' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleModeChange('infinite')}
          className="gap-1.5"
        >
          <ChevronDown className="w-4 h-4" />
          无限滚动
        </Button>
      </div>
    </div>
  )
}
