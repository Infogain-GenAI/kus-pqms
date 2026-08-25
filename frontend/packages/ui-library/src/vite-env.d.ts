/// <reference types="vite/client" />

// Needed because this package owns CSS Modules (*.module.css) and is type-checked
// on its own. Before the Phase 2 split there was one src/vite-env.d.ts at the app
// root that covered every file; splitting into packages gave each its own tsc
// program, and this one lost those ambient declarations with it.
