import { useTopicViewStore } from '@/stores/topic-view'
import { Button } from '@/components/ui/button'
import { List, ChevronDown } from 'lucide-react'

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useTopicViewStore()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">浏览模式：</span>
      <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-lg">
        <Button
          variant={viewMode === 'pagination' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('pagination')}
          className="gap-1.5"
        >
          <List className="w-4 h-4" />
          分页
        </Button>
        <Button
          variant={viewMode === 'infinite' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('infinite')}
          className="gap-1.5"
        >
          <ChevronDown className="w-4 h-4" />
          无限滚动
        </Button>
      </div>
    </div>
  )
}
