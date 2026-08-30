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
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { queryClient } from '@/app/queryClient'
import { RoleProvider } from '@/data/roles'
import { StoreProvider } from '@/data/store'
import { initMonitoring } from '@/shared/monitoring'
/*
 * i18n, imported for its SIDE EFFECT — it initialises the i18next instance every
 * `*.i18n.ts` registers its namespace against. Imported here rather than lazily
 * so the instance exists before any component's own `.i18n.ts` side effect runs.
 */
import '@/i18n'

/*
 * Error monitoring, BEFORE anything else runs — an error thrown while the tree
 * mounts is exactly the kind worth catching, and a sink installed after render
 * would miss it.
 *
 * This is a no-op unless `VITE_MONITORING_DSN` is set. It installs no handler,
 * makes no request and changes no behaviour without one; see the module.
 */
initMonitoring()

const el = document.getElementById('root')
if (!el) throw new Error('#root not found in index.html')

// NO <BrowserRouter> HERE ANY MORE. App.tsx is now a data router
// (`createBrowserRouter` + `RouterProvider`), which supplies its own history —
// wrapping it in a BrowserRouter would nest two routers.
//
// THE PROVIDERS STAY OUTSIDE THE ROUTER, and that is safe rather than incidental:
// neither RoleProvider nor StoreProvider imports anything from react-router
// (verified), so neither needs router context. Keeping them above the router also
// means role and store state survives every navigation, which is the behaviour
// the app already had.
/*
 * QueryClientProvider IS THE OUTERMOST PROVIDER, and the order is load-bearing.
 *
 * It goes above RoleProvider and StoreProvider because a query hook may
 * eventually be called from inside either of them, and a provider can only read
 * context from ABOVE it. Nesting it inside would work today — nothing in those
 * two providers queries anything yet — and fail later with a
 * "No QueryClient set" error at whichever call site was added, far from this
 * file. Putting it outside costs nothing and forecloses that.
 *
 * ⚠️ STOREPROVIDER IS STILL HERE AND STILL THE APP'S SOURCE OF TRUTH. Landing
 * the query client does not retire it — every screen still reads it. The two
 * coexist deliberately until the screens are moved over; see
 * `features/issues/issues.queries.ts` for the same note.
 */
createRoot(el).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </RoleProvider>
    </QueryClientProvider>
  </StrictMode>,
)
