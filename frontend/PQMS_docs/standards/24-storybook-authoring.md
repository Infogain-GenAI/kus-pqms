# 24 — Storybook Authoring
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
What a story file contains and how it relates to a component's
specification. `01-project-structure-and-architecture.md` owns *that*
Storybook exists and is the component verification surface; it says nothing
about what goes in a story.

## The relationship that makes this file necessary
A component has three artifacts and they are not redundant:

- **The spec** (`component-specs/<Name>.md`) says what the API **is**.
- **The stories** show what each value of that API **looks like**.
- **The `.spec.tsx`** asserts what it **does**.

**The story set is derived from the spec's Variants-and-sizes table,
mechanically.** Every value of every visual union gets a story. That is the
rule, and it is what makes a missing story reviewable: open the spec, count
the values, count the stories.

## Rules
| ID | Rule |
|---|---|
| SB-01 | **CSF3 format**, one `.stories.tsx` per component, co-located beside the component — *not* in the mirrored `src/tests/` tree. That tree is `10`'s and holds test files; a story is not a test. |
| SB-02 | A `Default` story shows the component with only its required props. It is the first story and it is what a reader sees first. |
| SB-03 | **One story per value of every visual union**, per the spec's table. A component with four variants and three sizes does not need twelve stories — it needs one per variant plus one per size, with the others at their defaults. |
| SB-04 | **One story per non-default state**: disabled, loading, error, empty, selected, indeterminate — whichever the spec says the component has. A state with no story is a state nobody has looked at. |
| SB-05 | **No story reaches the network, a store, or a router.** A component needing one of those is either misplaced (it belongs in `apps/portal`, per `01`) or needs the dependency injected as a prop. This is the constraint that keeps `ui-library` honest. |
| SB-06 | Args are typed from the component's own props interface. No `any`, no untyped `args` object. |
| SB-07 | A story never hardcodes a design value — `06`'s token rule applies to stories exactly as it does to components. |
| SB-08 | `@storybook/addon-a11y` is wired and its panel is checked during component review. Per `10` it is **manual** and does not substitute for the axe assertions in the test run. |
| SB-09 | A component's stories are written **in the same PR as the component**, never a follow-up. `01` makes Storybook the verification surface; a component with no stories has not been verified. |

## Interaction stories
Play functions are **permitted and encouraged for keyboard behaviour**,
which is where the primitive-backed components in `06`'s exception table are
most likely to be subtly wrong and where a static story shows nothing at
all. They do **not** replace the `.spec.tsx`: a play function demonstrates,
an assertion gates.

**Restates 15's placeholder, does not own it — whether CI builds
Storybook.** `15` carries this open
question with both sides stated. It is a Storybook question, so it is
recorded here too rather than only there. **Trigger:** W1-8. **Owner:**
Yogesh.**]**

## The file shape, worked

Every story file is CSF3 and opens the same way. `satisfies Meta<typeof X>`
rather than a type annotation — it type-checks the meta **and** keeps the
literal types, so `StoryObj<typeof meta>` narrows `args` to this component's
real props:

```tsx
// BaseButton.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { BaseButton } from "./BaseButton";

const meta = {
  title: "Base/BaseButton",
  component: BaseButton,
  parameters: { layout: "centered" },
  args: { children: "Save changes" },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof BaseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Danger: Story = { args: { variant: "danger" } };
export const Loading: Story = { args: { isLoading: true } };
export const Disabled: Story = { args: { disabled: true } };
```

Four things that example is demonstrating, each of which is the rule:

- **`title` mirrors the category folder**, so the sidebar and the file tree are
  the same tree. `Base/`, `Composite/`, `Feedback/`, `Layout/`, `Navigation/`,
  `Overlay/`, `Pqms/` — the categories 01-project-structure-and-architecture.md
  owns. A story filed under the wrong prefix is invisible to anyone browsing.
- **Shared setup lives in `meta.args`**, and each story overrides only what it
  is demonstrating. A story that re-declares every prop hides which one it is
  about.
- **One story per row of the spec's variant table**, named after the variant.
  Not "Example1", not "Playground".
- **`argTypes` are declared only where the inferred control is wrong.** A union
  usually infers a select correctly; declaring it again is noise that goes stale
  when the union changes.

## The three decorators an app-level story needs

A `ui-library` component renders standalone by definition — that is what makes
it a library component. An `apps/portal` component usually does not, and the
three things it reaches for are always the same:

| Missing | Symptom | Decorator |
|---|---|---|
| Router | `useNavigate`/`Link` throws on render | a memory router at the story's path |
| Query client | a query hook throws "No QueryClient set" | a fresh client per story, retries off |
| i18n | keys render instead of text | the app's i18n instance |

**Declare them in `.storybook/preview.tsx` globally**, not per file. Per-file
decorators mean the twentieth story author discovers the requirement by hitting
the error.

**A fresh query client per story, with `retry: false`** — a shared client leaks
cache between stories, so the story you open second shows the data from the one
you opened first, and a failing fixture retries three times before showing the
error state you were trying to look at.

**If a component needs a store to render, that is a finding, not a decorator.**
04-state-management.md's boundary says presentational components take props. A
component that cannot be storied without a store is one that will not be
testable either.

## Interaction stories — and their honest limit

A `play` function drives the component after render, and it is the right tool
for exactly one thing: **a visual state that only exists after an interaction**
and that a reviewer needs to see — an open dropdown, a form mid-validation, a
menu with the third item focused.

**It is not a substitute for a test.** Assertions in a `play` function run in a
browser nobody watches, are not in the coverage report, and do not gate CI. The
`.spec.tsx` is where behaviour is asserted, per 10-testing-standards.md.

The rule that follows: **a `play` function sets up state; it does not assert.**
If you find yourself writing `expect` in one, the assertion belongs in the spec
and the story should just show the resulting state.

## What the a11y addon does, and what it does not

It runs axe against the rendered story and shows violations in a panel. That is
genuinely useful while building, and it is **manual** — nobody is watching the
panel in CI, and the `build-storybook` step 15-devsecops-and-ci-cd.md adds
catches build breakage only.

**The gate is the axe sweep in the test run** (10-testing-standards.md), which
enumerates the barrel and fails the build. The addon is the fast feedback loop;
the sweep is the check. Treating the addon as the check is how a library ships
with violations nobody was ever told about.

## What does not get a story

- **Anything that is only a layout wrapper with no visual variation.** A story
  showing one immutable rendering is a screenshot with a build step.
- **Screens.** A screen's contract is its screen description
  (29-screen-description-authoring.md) and its route. Storying a whole screen
  means mocking its entire data layer, and the mock drifts from the fixtures
  that the app and the tests share.
- **A component with a single variant and no states.** Add the story when the
  second variant arrives.

**Everything in `packages/ui-library` does get one**, without exception — that
is what makes the library browsable, and a missing story is a review-blocking
finding per 16-code-review-checklist.md.

## Autodocs

Enable `tags: ["autodocs"]` on library components. The generated page reads prop
tables from the TypeScript types, so **the props documentation is the types** and
cannot drift from them.

Write the component's one-paragraph description as a TSDoc comment on the
component itself rather than in `parameters.docs`. It then serves the editor
tooltip, the generated page and the reader of the source from one place.

## Stories and the coverage gate

Story files are **excluded from coverage** (10-testing-standards.md's exclusion
list). Two consequences worth stating so nobody games them:

- **A story does not raise coverage.** Writing stories instead of tests moves
  the number nowhere, which is correct.
- **A story file must not contain logic.** Helper functions, fixture builders
  and mappers written inside a story file are invisible to the gate. Put them in
  the fixture modules 26-test-data-fixtures-and-test-scope.md owns, where the
  app and the tests use the same ones.
