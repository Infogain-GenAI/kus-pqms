// Design system first (tokens + fonts, all global custom properties), then the
// app's own base styles. These imports lead the file deliberately: CSS is
// emitted in import order, so anything imported above them would put component
// styles ahead of the tokens they build on and invert the cascade.
//
// THE ORDERING CONSTRAINT SURVIVED THE WORKSPACE SPLIT AND IS NOW LESS OBVIOUS.
// The first line used to read './styles/design-system/styles.css' and looked
// local; it is now a package specifier. Nothing about the requirement changed —
// the bundler still emits CSS in import order, and this line must still come
// first. It looks like an ordinary dependency import that a tidy-up could sort
// alphabetically or move below the React imports. It cannot be moved.
import '@pqms/design-tokens/styles.css'
import './styles/global.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { RoleProvider } from '@/data/roles'
import { StoreProvider } from '@/data/store'

const el = document.getElementById('root')
if (!el) throw new Error('#root not found in index.html')

createRoot(el).render(
  <StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </RoleProvider>
    </BrowserRouter>
  </StrictMode>,
)
