import { useTopicViewModeStore, type TopicViewMode } from "@/stores/topic-view-mode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { List, LayoutGrid, Video } from "lucide-react";

const modeOptions: { value: TopicViewMode; label: string; icon: React.ReactNode }[] = [
  { value: "classic", label: "经典模式", icon: <List className="w-4 h-4" /> },
  { value: "card", label: "卡片模式", icon: <LayoutGrid className="w-4 h-4" /> },
  { value: "media-only", label: "只看媒体", icon: <Video className="w-4 h-4" /> },
];

export function TopicViewModeSelector() {
  const { mode, setMode } = useTopicViewModeStore();

  return (
    <Select value={mode} onValueChange={setMode}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {modeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              {option.icon}
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
