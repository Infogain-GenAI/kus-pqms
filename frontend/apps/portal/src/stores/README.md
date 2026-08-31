# `stores/` — client state only

Structure mirrors the Vue application this is ported from
(`kus-pqms/frontend/apps/pqms-portal/src/stores/`): one folder per feature, a
`*.store.ts` inside it, an `index.ts` barrel per folder, and a root barrel.

```
stores/
  index.ts
  auth/
    index.ts
    auth.store.ts             ← Vue: auth/auth.store.ts
  issue-management/
    index.ts
    issue-filters.store.ts    ← Vue: issue-management/issue-filters.store.ts
```

## ⚠️ There is no `notification/` store, and that is the point

Vue has `stores/notification/notifications.store.ts`. It is **not** ported, and
this is the one place the port deliberately diverges from the structure rather
than following it.

`04-state-management.md` names that exact file as the thing being corrected:

> Three worked examples follow. Each is a real feature this app needs, and each
> is provenance from the prior Vue implementation of this product (repo
> `kus-pqms`, `frontend/apps/pqms-portal/src/stores/`), where the same three
> concerns were all Pinia stores — **the classification below is the correction,
> not a description of that structure.**

And then, unambiguously:

> **Notifications → TanStack Query.** Server-data cache, unambiguously: a
> notifications list, an unread count, background polling, and optimistic
> mark-read writes. **This is not a Zustand store.** Loading and error state come
> from `useQuery` itself rather than being fields you maintain.

**Where it lives instead:** `features/notifications/notifications.queries.ts`.

Reading Vue's store next to the React hooks shows why the standard says this.
Vue's version hand-maintains `loading`, `error`, `notifications` and
`unreadCount` as four refs kept in step by four separate code paths
(`load`, `markRead`, `markAllRead`, and the poll), plus a `setInterval` it must
start and stop from `AppHeader`'s mount and unmount, plus a `document.hidden`
check on every tick to avoid polling a background tab. All of that is state the
query layer owns for free — `refetchInterval` with its default
`refetchIntervalInBackground: false` replaces the interval, the visibility check
and both lifecycle hooks together.

## The classification rule, in one line

04 decides membership by **ownership, not shape**:

- Comes from a server, or caches something a server owns → **TanStack Query.
  Never a store here.**
- Purely a property of this client's session — a filter selection, a panel's open
  state, a sort direction → **a store here.**

A list of records fetched over HTTP is server state *even if you read it once*.
A sort direction is client state *even if you send it to the server as a query
parameter*.

⚠️ **The corollary that catches people:** reference data that is fetched once and
kept — the classification taxonomy, part options, the team directory — feels like
"load it at startup and stash it in a store". It is server-owned, so it is a
query with a long `staleTime`. Putting it here gives you a second cache with no
invalidation path, and the failure mode is an admin adding a system that nobody
sees until they hard-refresh.

## Adding a store

04 names the two below and immediately bounds the list:

> Zustand second, and it may not be needed at the current size. Its two stores
> here are auth/session and notifications. If the auth model is thin and
> notifications are server state, context plus the query client may cover it.
> **Do not add a store because this file names one.**

So a third folder needs a reason of its own, not a precedent. Classify the state
first; if it turns out to be server state, or trivially local component state, it
does not belong here.
