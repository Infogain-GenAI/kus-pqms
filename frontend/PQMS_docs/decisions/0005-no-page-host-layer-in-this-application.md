# ADR 0005 — No `pages/` host layer in this application

- **Status:** Accepted, 2026-08-25
- **Deciders:** Prisilla Ghadi
- **Related:** `../standards/07-routing-and-layouts.md` ("Route/page folder
  convention" — given a precondition by this ADR),
  `../standards/01-project-structure-and-architecture.md` ("A folder is not
  created before something lives in it"),
  `../standards/30-restructuring-an-existing-react-project.md` ("What to do when
  the existing project conflicts"), `../steps-for-new-repo.md` Step 7

---

## Context

07 reserves `pages/` for thin route-target wrappers, with the real UI under
`components/<Module>/<Feature>/`. This application routes straight from
`App.tsx` to `features/<feature>/<Name>Screen.tsx`.

**07 states its own justification, and it is testable:**

> The split earns its keep by keeping route concerns out of feature components.
> A page wrapper is where route params, redirects and layout assumptions live;
> the feature component underneath can then be rendered anywhere, including in
> Storybook, without a router.

Measured against this application:

| 07's premise | Here |
|---|---|
| Route params live in feature components | **One** `useParams`, in `IssueWorkspaceScreen` |
| Redirects live in feature components | **Zero** — both are already in `App.tsx`, where 07 wants them |
| The feature component could render without a router | **No** — six of seven screens call `useNavigate` for in-screen actions (row clicks, "Open" buttons, post-submit navigation) |
| A consumer benefits from router-free rendering | **None** — no Storybook, no tests, no second consumer |

Scale: **seven routes, no nested sub-routes, one layout route.**
07's provenance is `kus-pqms`, a **124-SFC** Vue application.

## Decision

**No `pages/` layer is introduced. Screens stay at
`features/<feature>/<Name>Screen.tsx`.**

And the reason is recorded as a rule rather than a one-off exemption, because the
next reader will otherwise re-open it:

> **The `pages/` split delivers its benefit only in combination with a
> callback-props refactor. Adopt both or neither. Adding hosts alone is
> ceremony.**

## Consequences

### The benefit is reachable, but not by adding hosts

This is the part worth being precise about, because "the screens call
`useNavigate`, so the split is impossible" would be **wrong**.

The navigation calls can be lifted into the host and passed down as callback
props — `onSelectIssue`, `onCreated` — leaving the screen router-free and
genuinely renderable anywhere. **That is the refactor that makes 07's stated
benefit real.**

It is a **content change across six screens**, not a move. It touches every
screen in a fidelity-locked port whose only behavioural check is a screenshot
harness that does not currently run
(18-project-context-and-implementation-status.md). And it has **no beneficiary
today**: nothing renders these screens outside the router.

So the honest position is not "we cannot" but **"we can, and the payoff is
currently zero"**. When a consumer appears — a test suite, Storybook, a second
embedding — both halves land together.

### Adding hosts alone would make things worse, not neutral

Seven files whose entire content is `return <XScreen />`, plus a
`components/<Module>/<Feature>/` renaming pass, buying a decoupling the code does
not have. It would also read as *done*: the next person sees `pages/`, assumes
07 is satisfied, and does not notice the screens still import the router.
**A structure that signals a property it does not have is worse than its
absence.**

01's own rule points the same way — *"a folder is not created before something
lives in it… an empty folder is a claim about architecture that nothing is
honouring."* A host containing one line is that claim in a thinner disguise.

### This is 30's conflict rule, applied

> A convention the existing project follows consistently and well, that this
> corpus contradicts — **raise it as a question against the standard.** A
> consistent convention is evidence; a rule that contradicts one deserves to be
> re-argued rather than mechanically applied.

The fifth time source precedence has resolved toward the repository — after the
Prettier values (ADR-0002), the ordinal spacing scale, the seven-status
vocabulary, and the submodule premise.

### What this does not license

**This is not a general exemption from 07.** Its layout routes, its
`id="main-content"` rule, its focus management and its lazy-loading guidance are
untouched and still apply. Only the `pages/` host convention is deferred, and
only while the preconditions above hold. **If the app grows nested sub-routes or
gains a router-free consumer, re-open this ADR** — those are the conditions that
change the answer.

## Options rejected

**Apply 07 as written — add seven hosts now.** Rejected: it delivers no benefit
this application can use, and it signals a decoupling the screens do not have.

**Apply the hosts *and* the callback-props refactor now.** The only option that
delivers 07's actual benefit, and rejected on timing rather than merit. It edits
six screens in a fidelity-locked port during a phase whose acceptance criterion
is "moves and renames only", with the screenshot harness unavailable to prove
nothing moved. **Correct work, wrong phase.**

**Amend 07 to drop the convention.** Rejected. The rule is sound at the size it
was written for, and `kus-pqms` is evidence that it pays there. What was missing
was a stated precondition, which 07 now carries.
