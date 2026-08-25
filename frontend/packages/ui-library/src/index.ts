// Public entry for @pqms/ui-library.
//
// ./components/index.ts is the vendored component barrel and is re-exported
// verbatim. Icon is re-exported here too because it is the ONLY sanctioned icon
// path (00-core-rules.md) and consumers previously reached it at '@/icons/Icon',
// which no longer exists outside this package.
//
// The import-restriction rule in eslint.adherence.config.mjs exists to keep
// consumers on THIS entry rather than reaching into component internals.
export * from './components'
export { Icon } from './icons/Icon'
export type { IconProps } from './icons/Icon'
