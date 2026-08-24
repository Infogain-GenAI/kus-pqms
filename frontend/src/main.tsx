// Design system first (tokens + fonts, all global custom properties), then the
// app's own base styles. These imports lead the file deliberately: CSS is
// emitted in import order, so anything imported above the components would put
// component styles ahead of the tokens they build on and invert the cascade.
import './styles/design-system/styles.css'
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
