export { NewTopicsPage } from './NewTopicsPage'
export { RecommendedTopicsPage } from './RecommendedTopicsPage'
export { default as NewTopicsPageDefault } from './NewTopicsPage'
export { default as RecommendedTopicsPageDefault } from './RecommendedTopicsPage'

// Re-export both components with unique default exports for Next.js
export { default as NewTopicsPageNext } from './NewTopicsPage'
export { default as RecommendedTopicsPageNext } from './RecommendedTopicsPage'

// Default export for Next.js - use NewTopicsPage as default
export { default } from './NewTopicsPage'
