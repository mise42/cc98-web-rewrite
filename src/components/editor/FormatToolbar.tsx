import { useMemo, useState, type ComponentType, type RefObject } from "react";
import {
  Bold,
  Code2,
  Heading1,
  Image,
  Italic,
  Link2,
  List,
  MessageSquareQuote,
  Smile,
  Strikethrough,
  Underline,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ubbEmojiMap, type EmojiCategory } from "@/config/ubb-emojis";

type EditorMode = "ubb" | "markdown";

type ToolbarAction = {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  apply: (selectedText: string) => string;
};

interface FormatToolbarProps {
  mode: EditorMode;
  value: string;
  onChange: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

const ubbActions: ToolbarAction[] = [
  {
    key: "bold",
    label: "加粗",
    icon: Bold,
    apply: (selected) => `[b]${selected || "加粗文字"}[/b]`,
  },
  {
    key: "italic",
    label: "斜体",
    icon: Italic,
    apply: (selected) => `[i]${selected || "斜体文字"}[/i]`,
  },
  {
    key: "underline",
    label: "下划线",
    icon: Underline,
    apply: (selected) => `[u]${selected || "下划线文字"}[/u]`,
  },
  {
    key: "strike",
    label: "删除线",
    icon: Strikethrough,
    apply: (selected) => `[s]${selected || "删除线文字"}[/s]`,
  },
  {
    key: "quote",
    label: "引用",
    icon: MessageSquareQuote,
    apply: (selected) => `[quote]${selected || "引用内容"}[/quote]`,
  },
  {
    key: "list",
    label: "列表",
    icon: List,
    apply: (selected) => `[list]\n[*]${selected || "条目 1"}\n[*]条目 2\n[/list]`,
  },
  {
    key: "code",
    label: "代码",
    icon: Code2,
    apply: (selected) => `[code]${selected || "代码片段"}[/code]`,
  },
];

const markdownActions: ToolbarAction[] = [
  {
    key: "heading",
    label: "标题",
    icon: Heading1,
    apply: (selected) => `## ${selected || "标题"}`,
  },
  { key: "bold", label: "加粗", icon: Bold, apply: (selected) => `**${selected || "加粗文字"}**` },
  {
    key: "italic",
    label: "斜体",
    icon: Italic,
    apply: (selected) => `*${selected || "斜体文字"}*`,
  },
  {
    key: "strike",
    label: "删除线",
    icon: Strikethrough,
    apply: (selected) => `~~${selected || "删除线文字"}~~`,
  },
  {
    key: "quote",
    label: "引用",
    icon: MessageSquareQuote,
    apply: (selected) => `> ${selected || "引用内容"}`,
  },
  {
    key: "list",
    label: "列表",
    icon: List,
    apply: (selected) => `- ${selected || "条目 1"}\n- 条目 2`,
  },
  {
    key: "code",
    label: "代码",
    icon: Code2,
    apply: (selected) => `\n\`\`\`\n${selected || "代码片段"}\n\`\`\`\n`,
  },
];

const markdownEmojiList = ["🙂", "😂", "🥳", "👍", "❤️", "🔥", "👀", "🎉"];
const RECENT_EMOJI_STORAGE_KEY = "editor-recent-ubb-emojis";
const RECENT_EMOJI_LIMIT = 20;

function loadRecentEmojiTokens() {
  try {
    const raw = localStorage.getItem(RECENT_EMOJI_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const validTokenSet = new Set(
      Object.values(ubbEmojiMap)
        .flat()
        .map((item) => item.token),
    );
    return parsed
      .filter((item) => typeof item === "string")
      .filter((token) => validTokenSet.has(token))
      .slice(0, RECENT_EMOJI_LIMIT);
  } catch {
    return [];
  }
}

export function FormatToolbar({ mode, value, onChange, textareaRef }: FormatToolbarProps) {
  const [panel, setPanel] = useState<"link" | "image" | null>(null);
  const [emojiCategory, setEmojiCategory] = useState<EmojiCategory>("em");
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState("");
  const [recentEmojiTokens, setRecentEmojiTokens] = useState<string[]>(loadRecentEmojiTokens);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("https://");
  const [imageAlt, setImageAlt] = useState("");

  const actions = mode === "ubb" ? ubbActions : markdownActions;

  const allUbbEmojis = useMemo(() => Object.values(ubbEmojiMap).flat(), []);

  const ubbEmojiLookup = useMemo(() => {
    const map = new Map<string, (typeof allUbbEmojis)[number]>();
    allUbbEmojis.forEach((item) => map.set(item.token, item));
    return map;
  }, [allUbbEmojis]);

  const recentUbbEmojis = useMemo(
    () =>
      recentEmojiTokens
        .map((token) => ubbEmojiLookup.get(token))
        .filter((item): item is (typeof allUbbEmojis)[number] => !!item),
    [recentEmojiTokens, ubbEmojiLookup],
  );

  const filteredUbbEmojis = useMemo(() => {
    const list = ubbEmojiMap[emojiCategory];
    const keyword = emojiSearch.trim().toLowerCase();
    if (!keyword) return list;
    return list.filter(
      (item) => item.token.toLowerCase().includes(keyword) || item.label.includes(keyword),
    );
  }, [emojiCategory, emojiSearch]);

  const getCurrentSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return "";
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    return value.slice(start, end);
  };

  const insertText = (inserted: string) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      onChange(`${value}${inserted}`);
      return;
    }

    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const nextValue = `${value.slice(0, start)}${inserted}${value.slice(end)}`;

    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const caret = start + inserted.length;
      textarea.setSelectionRange(caret, caret);
    });
  };

  const applyAction = (action: ToolbarAction) => {
    const inserted = action.apply(getCurrentSelection());
    insertText(inserted);
  };

  const insertLink = () => {
    if (!linkUrl.trim()) return;

    const text = linkText.trim() || getCurrentSelection() || "链接";
    const inserted =
      mode === "ubb"
        ? text === linkUrl.trim()
          ? `[url]${linkUrl.trim()}[/url]`
          : `[url=${linkUrl.trim()}]${text}[/url]`
        : `[${text}](${linkUrl.trim()})`;

    insertText(inserted);
    setPanel(null);
  };

  const insertImage = () => {
    if (!imageUrl.trim()) return;

    const inserted =
      mode === "ubb"
        ? `[img]${imageUrl.trim()}[/img]`
        : `![${imageAlt.trim() || "图片"}](${imageUrl.trim()})`;

    insertText(inserted);
    setPanel(null);
  };

  const insertEmoji = (emoji: string) => {
    insertText(emoji);

    if (!ubbEmojiLookup.has(emoji)) return;

    setRecentEmojiTokens((prev) => {
      const next = [emoji, ...prev.filter((token) => token !== emoji)].slice(0, RECENT_EMOJI_LIMIT);
      localStorage.setItem(RECENT_EMOJI_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/20 px-2 py-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.key}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => applyAction(action)}
              title={action.label}
              aria-label={action.label}
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2"
          onClick={() => {
            setPanel(panel === "link" ? null : "link");
            setShowEmojiPanel(false);
          }}
          title="插入链接"
          aria-label="插入链接"
        >
          <Link2 className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2"
          onClick={() => {
            setPanel(panel === "image" ? null : "image");
            setShowEmojiPanel(false);
          }}
          title="插入图片"
          aria-label="插入图片"
        >
          <Image className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2"
          onClick={() => {
            setShowEmojiPanel((prev) => !prev);
            setPanel(null);
            setEmojiSearch("");
          }}
          title="表情面板"
          aria-label="表情面板"
        >
          <Smile className="h-3.5 w-3.5" />
        </Button>
      </div>

      {panel === "link" && (
        <div className="rounded-md border border-border bg-background p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">插入链接</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => setPanel(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://"
          />
          <Input
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="链接文本（可选）"
          />
          <div className="flex justify-end">
            <Button type="button" size="sm" onClick={insertLink}>
              插入链接
            </Button>
          </div>
        </div>
      )}

      {panel === "image" && (
        <div className="rounded-md border border-border bg-background p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">插入图片</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => setPanel(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://"
          />
          {mode === "markdown" && (
            <Input
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="图片描述（可选）"
            />
          )}
          <div className="flex justify-end">
            <Button type="button" size="sm" onClick={insertImage}>
              插入图片
            </Button>
          </div>
        </div>
      )}

      {showEmojiPanel && (
        <div className="rounded-md border border-border bg-background p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">表情面板</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => setShowEmojiPanel(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {mode === "ubb" ? (
            <>
              {recentUbbEmojis.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">最近使用</div>
                  <div className="grid grid-cols-6 gap-2">
                    {recentUbbEmojis.map((emoji) => (
                      <button
                        key={`recent-${emoji.token}`}
                        type="button"
                        className="flex h-10 items-center justify-center rounded-md border border-border bg-muted/20 transition-colors hover:bg-muted/40"
                        onClick={() => insertEmoji(emoji.token)}
                        title={emoji.token}
                        aria-label={emoji.token}
                      >
                        <img
                          src={emoji.imageSrc}
                          alt={emoji.label}
                          className="h-6 w-6 object-contain"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {(["em", "ac", "ms", "tb"] as const).map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={emojiCategory === category ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setEmojiCategory(category)}
                  >
                    {category.toUpperCase()}
                  </Button>
                ))}
              </div>
              <Input
                value={emojiSearch}
                onChange={(e) => setEmojiSearch(e.target.value)}
                placeholder="搜索表情标签，如 em12 / ac10"
              />
              <div className="max-h-56 overflow-y-auto pr-1">
                <div className="grid grid-cols-6 gap-2">
                  {filteredUbbEmojis.map((emoji) => (
                    <button
                      key={emoji.token}
                      type="button"
                      className="flex h-10 items-center justify-center rounded-md border border-border bg-muted/20 transition-colors hover:bg-muted/40"
                      onClick={() => insertEmoji(emoji.token)}
                      title={emoji.token}
                      aria-label={emoji.token}
                    >
                      <img
                        src={emoji.imageSrc}
                        alt={emoji.label}
                        className="h-6 w-6 object-contain"
                      />
                    </button>
                  ))}
                </div>
                {filteredUbbEmojis.length === 0 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    未找到匹配表情
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-8 gap-2">
              {markdownEmojiList.map((emoji) => (
                <Button
                  key={emoji}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-base"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
