export { MyTopicsPage } from './MyTopicsPage'
export { MyPostsPage } from './MyPostsPage'
export { default as MyTopicsPageDefault } from './MyTopicsPage'
export { default as MyPostsPageDefault } from './MyPostsPage'

// Re-export both components with unique default exports for Next.js
export { default as MyTopicsPageNext } from './MyTopicsPage'
export { default as MyPostsPageNext } from './MyPostsPage'

// Default export for Next.js - use MyTopicsPage as default
export { default } from './MyTopicsPage'
