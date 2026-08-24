# 13 — Security Standards
**Tier:** 1
**Status:** APPROVED — REVISION 2

Assumes 00-core-rules.md; where the two conflict, 00 wins.

**Incoming obligation (from 08-authentication-and-authorization.md):**
this file's eventual CSP section must be strict enough to make
sessionStorage-based MSAL token caching an acceptable tradeoff — 08's
token-storage decision treats this as load-bearing, not optional.
Whoever drafts this file must address CSP explicitly with that
constraint in mind, not as a generic OWASP checklist item.

This obligation is discharged in the Content Security Policy section
directly below.

## Content Security Policy
**A CSP must be built. There is nothing to carry forward.** The prior
Vue implementation of this product (repo `kus-pqms`) had none — no CSP
`<meta>` tag in `apps/pqms-portal/index.html`, no `vite-plugin-csp` or
equivalent in any `package.json`, and no `staticwebapp.config.json`,
`nginx.conf`, `web.config`, or other deploy-level header configuration
anywhere. So this section is a specification, not a port, and the
policy below has never actually run.

Directives, each tied to this app's specific behaviour rather than
stated as generic hardening advice:

- **`script-src 'self'`** — this app has no inline `<script>`
  content, no `eval`/`Function`-constructor usage, and no third-party
  script origins, and must not acquire any. Nothing here requires
  `'unsafe-inline'` or `'unsafe-eval'`.
- **`connect-src 'self' https://login.microsoftonline.com` [+ real API
  origins, PLACEHOLDER — see below]** — `login.microsoftonline.com`
  must be listed explicitly, and this isn't precautionary: a CSP
  `connect-src` omitting this exact origin has caused a real, reported
  production failure — AzureAD/microsoft-authentication-library-for-js
  issue #7178, where MSAL's own token-endpoint calls were refused by
  the browser because the deploying app's CSP didn't allow them. This
  app's real API origins (`VITE_API_BASE_URL`,
  `VITE_NOTIFICATION_API_BASE_URL`, and whatever endpoint
  `VITE_MONITORING_DSN` eventually points at) are localhost values in
  development — the production values are **[PLACEHOLDER — populate
  once real backend URLs exist]**.
- **`frame-src https://login.microsoftonline.com`** — required because
  MSAL's `acquireTokenSilent`/`ssoSilent` load a hidden iframe against
  this origin before either succeeding silently or falling through to a
  redirect (verified directly against Microsoft's own MSAL
  documentation for the silent-auth flow). This is a distinct concern
  from Microsoft's own `X-Frame-Options: DENY` on its *interactive*
  login page — that header is Microsoft's own restriction on rendering
  credential-entry UI inside a frame, and it does not apply to the
  silent flow, which never renders that interactive UI before it either
  succeeds or redirects out of the frame.
- **`style-src 'self'`** — Tailwind generates static utility classes at
  build time; no runtime inline-style injection was found anywhere in
  this app. If Vite's dev-mode HMR needs a relaxation of this
  directive to function, that relaxation is dev-only and never ships to
  a production build.
- **`object-src 'none'`, `base-uri 'self'`, `form-action 'self'`** —
  standard hardening directives; nothing about this app's behaviour
  needs anything looser than these three defaults.

**Verification, stated explicitly rather than left as an assumption
that the policy "just works":**

1. **Automated**: a Playwright check asserting no browser console
   errors matching CSP-violation patterns (`"Refused to..."`) during
   normal app navigation. This runs in CI and catches directive-syntax
   errors and missing-origin mistakes long before a real Entra tenant
   exists to test the auth flow against.
2. **Manual, named trigger**: verify silent refresh succeeds against a
   live Entra tenant once one is reachable — check the
   browser console specifically during the roughly-hourly
   `acquireTokenSilent` cycle for CSP violations. This is the only way
   to catch a `connect-src`/`frame-src` mistake that would otherwise
   surface silently, in production, about an hour after a user logs in
   — well after the login flow itself already looked like it succeeded.

**No deployment target has been chosen**, so where these headers are
actually served from is undetermined — a `<meta>` tag, a static-host
config, or a reverse proxy are all still open. This is not an infra
question waiting on an answer; choosing a target is itself unstarted
work, upstream of this one. Provenance: the same was true in
`kus-pqms`, which had no Static Web Apps config, App Service reference,
Dockerfile, Kubernetes manifest, or Terraform-provisioned hosting
resource for the frontend, despite its backend having all of them.
Tracked in 18-project-context-and-implementation-status.md; revisit
this CSP's header interaction once a real target exists.

## XSS
**`dangerouslySetInnerHTML` is not itself safe or unsafe. The safety
property lives entirely in the function that produces the string handed
to it.** So the rule is about that function, not about the API:

**Never pass `dangerouslySetInnerHTML` content that has not already
been through an HTML-escaping step — full stop.** The escaping must
happen *inside* the string-producing function, before the value ever
reaches the prop. The prop grants nothing on its own.

**The one place this is expected to apply**: rendering user-authored
markdown in a comment card. The markdown renderer must HTML-escape the
whole input string before inserting any tag of its own, so that nothing
a comment author wrote can reach the DOM as markup. That renderer is
part of the unspecified `ui-library` surface — see
01-project-structure-and-architecture.md's component-specification gap
— so this rule constrains it in advance rather than describing it.

Provenance: in `kus-pqms` this was `BaseCommentCard`, the **only**
`v-html` usage in the entire codebase, and its inline comment stated
the property exactly: *"`v-html` is safe here for exactly one reason:
`renderMarkdown` HTML-escapes the whole string before inserting any tag
of its own, so nothing the comment author wrote can reach the DOM as
markup."* One usage, one guarantee, documented at the call site — that
is the standard to match, not merely the count.

**The failure mode to guard against is a later change, not the first
write.** The moment someone swaps in a different renderer without
re-establishing the escape-before-render property, this becomes a real
stored-XSS path. Whatever the renderer ends up being, state that
property in a comment at the usage site so the next person cannot
remove it accidentally.

**Cross-reference, not the same case**: `BaseMarkdownEditor` is the
other real rich-content surface in this app (a separate component,
whose lazy-loading is covered in 12-performance-guidelines.md's "Code
splitting beyond routes" section), but it's a materially different
case — it's a schema-constrained *editing* model, not a render-only
`v-html`/`dangerouslySetInnerHTML` case.

**The dependency is TipTap**, not ProseMirror directly — stated
precisely because this is a security claim and someone verifying it
will grep the manifest. In `kus-pqms`,
`packages/ui-library/package.json` had **no `prosemirror-*`
dependency**; it had five `@tiptap/*` packages, and the editor
component imported only from `@tiptap/*`. An earlier revision of this
section named ProseMirror as the dependency, which
would have led a reader checking `package.json` to find nothing and
reasonably conclude the reasoning was fabricated.

**The schema-based safety property still holds through that layer.**
TipTap is built on ProseMirror and bundles it via `@tiptap/pm`; TipTap's
extensions (`@tiptap/starter-kit` and friends, as used by this
component) *are* ProseMirror schema definitions. So the safety property
is unchanged in substance: it comes from the schema constraining what
node and mark types can exist in the document at all, not from an
escape-before-render step. What changed is only which package name is
correct — the guarantee is TipTap's schema, which is a ProseMirror
schema.

The two surfaces shouldn't be conflated when reasoning about this app's
XSS exposure. And the distinction is load-bearing for a future change:
swapping the editor for one **without** a constraining schema would
remove this guarantee entirely, and that risk attaches to the editor
library — TipTap — not to a transitive ProseMirror version.

## Input validation
This file does not restate the mechanism — it's already fully owned
elsewhere: 05-api-integration-and-data-fetching.md's "Input validation
and schema parsing" section (strict-by-default Zod schemas at the
mapper boundary, with exactly three named, documented leniency
exceptions) and 03-react-component-patterns-and-naming.md's "Forms and
validation" section (the same Zod version, used for client-side form
schemas) together are this app's actual input-validation architecture.

Stated plainly why this belongs in a security file at all, not just a
data-quality one: **strict response parsing at the trust boundary is
itself an injection/malformed-data defense**, not merely a UX nicety.
A backend response that doesn't match its expected shape is refused at
the boundary rather than silently flowing into components as
`undefined` or a mismatched type — this closes off a class of
malformed-data-reaches-the-DOM paths at the same point 05 already
requires validation to happen, not a separate control this file needs
to introduce.

## Secrets and environment variables
**The `VITE_` prefix rule, stated as an ongoing rule, not a one-time
check**: anything with this prefix is bundled into client-visible code
at build time, regardless of "it's just an env var" framing — there is
no server-side-only tier to a `VITE_`-prefixed value. This must never
receive an API key, a connection string, or any other credential-shaped
value, now or later.

### The expected inventory: seven vars
This app is expected to need exactly these seven. Every one **must be**
declared in `env.d.ts` (see the mechanism below), and every one is
public-shaped:

| Var | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Issue-management API base |
| `VITE_NOTIFICATION_API_BASE_URL` | Notification service base — separate origin/path-space |
| `VITE_USE_FIXTURES` | Fixtures-mode flag (per 04) |
| `VITE_MONITORING_DSN` | Error-monitoring sink; unset = console-only |
| `VITE_MASTER_DATA_API_URL` | Dev-server proxy target |
| `VITE_ISSUE_MANAGEMENT_API_URL` | Dev-server proxy target |
| `VITE_NOTIFICATION_API_URL` | Dev-server proxy target — the `/api/notification` prefix, distinct from the base URL above |

**How many of these seven survive depends on a decision outside this
file.** Five of the seven are per-service origins or proxy targets, and
they exist because the backend was three services. BRD `AR-01`/`DEC-08`
commit to **one** deployable behind one `/api/v1/**` surface, under which
`VITE_NOTIFICATION_API_BASE_URL`, `VITE_MASTER_DATA_API_URL`,
`VITE_ISSUE_MANAGEMENT_API_URL` and `VITE_NOTIFICATION_API_URL` collapse
into `VITE_API_BASE_URL` plus one proxy target — **seven variables become
three.** See 05-api-integration-and-data-fetching.md's placeholder on the
origin count; this inventory and 20's dev-proxy snippet move with it.

**Do not pre-emptively collapse them.** The inventory's whole value is
that it is derived from `env.d.ts` and `vite.config.ts` rather than
remembered — re-derive it when the decision lands, exactly as the
procedure below requires.

**The last three are consumed by `vite.config.ts`, and that does not
exempt them.** They carry the `VITE_` prefix, so Vite loads them and
exposes them to client code through `import.meta.env` exactly like the
other four. The prefix rule above applies to them in full. Do not
assume a var is server-side merely because only the Vite config reads
it — the prefix, not the reader, determines exposure.

Note the near-collision in the last two notification entries:
`VITE_NOTIFICATION_API_BASE_URL` is the client's base URL and
`VITE_NOTIFICATION_API_URL` is the dev proxy target. Two names one word
apart, for two different things. That is worth flagging rather than
tidying here, because renaming either one is a change to an environment
contract, not to a document.

None of the seven is credential-shaped: five base or target URLs, one
feature flag, one monitoring endpoint.

### How this count is derived — and why it was wrong twice
**Read `env.d.ts`'s `ImportMetaEnv` and `vite.config.ts` together.
Never enumerate this list from memory or from a previous revision of
it.** The inventory above is a *derived* artifact; the interface is the
source.

That is stated as a procedure because this section has now undercounted
twice. An earlier revision said four vars; it was corrected to six; the
real number is seven. **Each correction moved the number without
re-running the derivation** — which is the same failure the section
below exists to prevent, committed inside the section that describes
it.

The seventh, `VITE_NOTIFICATION_API_URL`, is exactly the case this
section warns about: it feeds `vite.config.ts`'s `/api/notification`
proxy, it is **not** declared in `env.d.ts`, and it was therefore
invisible to every audit that read the inventory rather than the
environment.

Provenance, corrected: `kus-pqms` used these seven, and **three** of
them — all three proxy targets — were added without the check and never
declared in `ImportMetaEnv`, which declared only four of the seven. An
earlier revision of this passage said two. No live exposure resulted,
because all three were localhost URLs. The lesson is the mechanism
below, not the vars.

### The rule needs a mechanism, not a restatement
"Any `VITE_*` addition gets the same check before it's added" is the
right rule, and in `kus-pqms` it **failed** — three vars were added
without it, because nothing made a missed check visible. Restating it
more firmly would reproduce that failure. So the rule has a
mechanism:

**`env.d.ts`'s `ImportMetaEnv` interface is the authoritative inventory
of `VITE_*` vars.** Every `VITE_`-prefixed variable must be declared
there, with a docblock saying what it is for. Two consequences that do
the enforcing:

- **An undeclared var is a visible mismatch, not a manual audit.** A
  `VITE_*` var present in `.env` or `vite.config.ts` but absent from
  `ImportMetaEnv` is caught by reading one file against another, and any
  consumer touching `import.meta.env.X` for an undeclared `X` is a type
  error rather than a silent `any`. All three proxy targets were
  invisible in `kus-pqms` precisely because they were never declared.
- **Check the mismatch in both directions.** Declared-but-unset is the
  reverse case and matters too: it is not a security problem, but a var
  the type says exists and the environment does not provide means a
  client falls back silently. In `kus-pqms` this was
  `VITE_NOTIFICATION_API_BASE_URL` — declared, never set.

Enforcement at review time is 16-code-review-checklist.md's job — see
its Security section, which now carries this as a check. The rule lives
here; the gate lives there.

### `VITE_USE_FIXTURES` — one contract, stated in three places
Per 04-state-management.md, fixtures mode is **explicit opt-in**: only
the exact string `"true"` enables it, and anything else — absent,
misspelled, `"0"` — means real mode. Three artifacts must state that
same contract, and they must agree:

- **`env.d.ts`** — the docblock says only `"true"` enables fixtures and
  anything else means real mode.
- **`.env.example`** — sets `VITE_USE_FIXTURES=true`, with a comment
  saying fixtures are opt-in and that this file is the
  local-development starting point.
- **`.env`** — per-developer, and **gitignored**, so it is not the file
  that communicates anything to anyone else.

**Never describe fixtures mode as "the default" in any of the three.**
There is no default: the value is load-bearing, because it also gates
the authentication bypass in 08's "Fixtures-mode authentication".

`.env.example` is the tracked file and therefore the one that must be
right — it is the only one a new developer reads. Provenance for why
this is spelled out at all: in `kus-pqms` all three described fixtures
as "(default)", and `.env` and `.env.example` disagreed on the actual
value (`=true` versus `=false`) while carrying that same comment. That
was survivable when the flag gated only data. It is not survivable now
that it gates auth.

## Secrets never reach a log or a monitoring sink
**21-logging-formatting-and-client-diagnostics.md owns the prohibition
list**; it is named here because a security reader looks for it in a
security file, and because two of its entries are this section's concern
rather than a logging convention:

- **No token, credential or `Authorization` header value** in any log
  line or telemetry event. Concretely: never log a raw request or
  response object, because either may carry one.
- **A `VITE_*` value is public** and therefore safe to log — but that is a
  consequence of the prefix rule above, not a general permission. A value
  that is public in the bundle is still not necessarily appropriate in a
  third-party sink.

**25-observability-and-client-telemetry.md carries the same prohibitions
for the monitoring sink**, and the bar there is higher rather than lower:
a sink is a third party. Note that adding one also adds a `connect-src`
origin to the CSP above — the `VITE_MONITORING_DSN` placeholder in that
section is that origin.

## CSRF
**This is not the primary threat model here, and stating why matters
more than a generic CSRF checklist item would.** The HTTP client's auth
mechanism is `Authorization: Bearer <token>`, sourced from MSAL's
`sessionStorage`-backed cache via a request interceptor (per
08-authentication-and-authorization.md) — not a cookie the browser
automatically attaches to outgoing requests. The classic CSRF
precondition (the browser silently sends a stored credential on any
request to the target origin, including ones the user didn't
knowingly initiate) does not exist in this architecture: there is no
credential the browser attaches on its own, only one this app's own
JavaScript reads from `sessionStorage` and attaches explicitly.

**Forward note, not a current action item**: this changes if 08's
cookie/BFF escalation trigger ever fires — moving to HTTP-only cookie
storage reintroduces the exact precondition CSRF protection exists for.
CSRF protection becomes relevant again at that point and should be
designed against the real backend/BFF contract that triggers it, not
built preemptively now for an architecture this app doesn't currently
have.

## Dependency security
Before adding any new dependency, evaluate its maintenance status and
known-vulnerability history — the same evaluation habit already stated
in 12-performance-guidelines.md's "Package and dependency evaluation"
section, applied here from a security angle (is this package
maintained, does it have open CVEs) rather than that file's bundle-size
angle. One evaluation, two reasons to run it — not two separate
processes.

## Build mode as a fuse — the house pattern, named
The prior repository uses one mechanism three separate times, in three unrelated
files, without ever naming it. It is worth naming, because it is the difference
between a rule and an enforced rule.

| Where | The fuse |
|---|---|
| The HTTP client | throws at construction if `import.meta.env.PROD` and the base URL is not `https://` |
| The auth store | `switchRole()` throws under `PROD` — "a prototype-only mechanism" |
| Fixtures mode | this corpus's `PROD` fuse on the authentication bypass |

**The rule.** Anything that exists for local development and would be a
vulnerability in production must be fused with a build-mode assertion that
**throws**, not warned about in a comment. Three properties make it work:

- **It fails at construction or at first call**, not at the moment of exploit.
- **It is untestable-around.** A comment is advisory; a throw is not.
- **It survives the person who wrote it.** The developer who removes the comment
  block six months later does not remove the throw, because the throw has a test.

A fuse is not a substitute for infrastructure-level enforcement — the HTTPS
tripwire above is explicitly a stopgap until a gateway enforces it. **Record
that in the fuse's own comment**, so it is retired deliberately rather than
forgotten into permanence.

## Dependency supply chain — a release-age hold
The prior repository configures a **minimum release age** for dependencies, with
a per-package exception list naming 28 packages of one library at one version.

That is a real supply-chain control and this file did not have one: a
compromised package is most dangerous in the hours after publication, and a
cooling-off period costs nothing except the ability to adopt a release the day
it lands. **Adopt it**, with the exception list as the pressure valve — an
exception names a package *and* a version, so it expires by construction rather
than granting that package permanent immunity.

Pair it with automated dependency updates (15-devsecops-and-ci-cd.md) and audit
scanning; the three answer different threats and none replaces the others.

## The environment inventory is an interface, and it is enforced by nothing else
This file makes the `ImportMetaEnv` interface the authoritative `VITE_*`
inventory. 18-project-context-and-implementation-status.md records that the
scaffold has no such interface — so **at the time of writing, nothing enforces
the rule this file's whole mechanism rests on.** That is the first thing to fix,
and it is one file.

## The scanning layer already exists — six tools, and what each covers

This file specifies dependency and secret scanning as things to adopt. In the
target repository they are configured and running
(`.gitlab-ci-templates/security.gitlab-ci.yml`, per `docs/STACK.md` §6):

| Tool | Scope | Gate |
|---|---|---|
| **OWASP Dependency-Check** | backend (Gradle) | fails on CVSS **≥ 7.0** |
| **`pnpm audit`** | frontend, against `pnpm-lock.yaml` | see below |
| **gitleaks** | whole repo | secret scanning |
| **CycloneDX SBOM** | dependency inventory | generated, not gating |
| **License compliance** | `scripts/check-forbidden-licenses.py` | fails on a forbidden licence |
| **SonarQube** | static analysis | see 15 |

**So the frontend's job is to fit into this, not to build a parallel one.**
Three specifics:

- **The `pnpm audit` severity floor still needs deciding**, and
  15-devsecops-and-ci-cd.md's resolution (fail at `high`, warn below, allowlist
  entries carrying a required ≤90-day expiry) is a **proposal to the client**
  here rather than a decision this corpus can make — the pipeline is theirs.
- **The backend's CVSS ≥ 7.0 threshold is the precedent to match.** CVSS 7.0 is
  the floor of "High", so failing frontend builds at `high` and above puts both
  components on the same line. Proposing a different frontend threshold needs an
  argument, and there isn't an obvious one.
- **gitleaks covers the whole repository**, which subsumes this file's
  secrets-never-committed rule with an actual check. What it does **not** cover
  is 21-logging-formatting-and-client-diagnostics.md's rule about secrets
  reaching a *log line or a monitoring sink* at runtime — a different failure,
  detected by a different mechanism, and still unowned by any tool.

### The supply-chain hold moves file
This file recommends a minimum release age with a per-package exception list.
**pnpm 11 no longer reads non-auth settings from `.npmrc`** — they live in
`pnpm-workspace.yaml` (`docs/STACK.md` §3). So the hold, `autoInstallPeers` and
`strictPeerDependencies` all belong there.

That file already carries `allowBuilds: { esbuild: true, msw: true }`, and the
note attached to it is worth reading before touching anything: **pnpm does not
run dependency build scripts unless allowed, and esbuild needs its postinstall
or `vite build` fails.** An `allowBuilds` entry is a deliberate supply-chain
exception — adding one is a security decision, and removing one breaks the
build in a way that looks unrelated.

### CSP under CloudFront
This file specifies a Content-Security-Policy. A static SPA has no server to set
one — it is a **CloudFront response-headers policy**, defined in `infra/`.
Same shape as 12-performance-guidelines.md's cache headers: this corpus states
the required policy, `infra/` implements it, and review confirms the two agree.
