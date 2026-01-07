// UBB 解析器
// 从 vendor/cc98-web-upstream/Ubb 复制
// 注意：这些文件需要逐步重构为 TypeScript 和现代 React

export * from './Core'
export * from './UbbCodeExtension'

// Handlers
export * from './handlers/AcTagHandler'
export * from './handlers/AlignTagHandler'
export * from './handlers/AudioTagHandler'
export * from './handlers/BBCodeTagHandler'
export * from './handlers/BiliTagHandler'
export * from './handlers/BlockQuoteTagHandler'
export * from './handlers/BTagHandler'
export * from './handlers/ColorTagHandler'
export * from './handlers/CodeTagHandler'

// Parsers
export * from './parsers/TopicTagParser'
export * from './parsers/FocusTagParser'
EOF