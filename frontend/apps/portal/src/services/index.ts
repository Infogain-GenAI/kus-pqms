import { isFixtureMode } from '@/config/data-source'
import * as issueFixtures from '@/api/issues'
import * as notificationFixtures from '@/api/notifications'
import * as issueApi from './issue.service'
import * as notificationApi from './notification.service'
import type { IssueListQuery, IssueListResult } from '@/api/issues'
import type { NotificationListResult, NotificationQuery } from '@/api/notifications'
import type { Issue } from '@/data/types'

/**
 * THE SWITCH. This is what makes `VITE_USE_FIXTURES` load-bearing.
 *
 * Every consumer imports from here and gets whichever implementation the
 * environment asks for. Nothing above this file knows which one it got, which is
 * the entire point: a screen written against `issues.list()` works unchanged on
 * both paths, and cutting over is an env change rather than a code change.
 *
 * ─── THE BRANCH IS READ PER CALL, NOT AT IMPORT ──────────────────────────────
 *
 * `isFixtureMode()` is called INSIDE each function, never hoisted to a
 * module-level constant. A constant would freeze the value at import time, which
 * silently ignores `vi.stubEnv` and makes a live-branch test pass while actually
 * exercising fixtures — the failure the Vue `data-source.ts` header warns about,
 * one level up.
 *
 * ─── HOW THIS DIFFERS FROM VUE, DELIBERATELY ─────────────────────────────────
 *
 * Vue branches at each CALL SITE (`isFixtureMode() ? fetchIssueById(id) :
 * issueService.getById(id)`), so which components have migrated stays visible
 * and each cutover is individually revertible. That was the right shape for an
 * app migrating screen by screen against a partially-built backend.
 *
 * This app has migrated NO screens and has no backend at all, so a per-call-site
 * branch would mean scattering a decision nobody has made yet across dozens of
 * files. Centralising it here keeps the cutover to one place. If a partial
 * migration is ever needed — half the screens live, half on fixtures — the
 * per-call-site form is the answer, and this facade is where that split would be
 * introduced.
 *
 * ─── ⚠️ NOTHING CALLS THIS YET, ON PURPOSE ───────────────────────────────────
 *
 * `data/store.tsx` is still the app's source of truth and every screen still
 * reads it. This layer is landed, typed and tested first, so that wiring a
 * screen to it later is a reviewable change on its own rather than a rewrite
 * bundled with the introduction of an HTTP client.
 */

/** Issue reads. Both implementations satisfy this exactly. */
export const issues = {
  list(query: IssueListQuery = {}): Promise<IssueListResult> {
    return isFixtureMode() ? issueFixtures.fetchIssues(query) : issueApi.listIssues(query)
  },

  /** Resolves `null` for a record that does not exist — see both implementations. */
  getById(id: string): Promise<Issue | null> {
    return isFixtureMode() ? issueFixtures.fetchIssueById(id) : issueApi.getIssueById(id)
  },

  scopeCounts(user: string): Promise<{ own: number; all: number }> {
    return isFixtureMode() ? issueFixtures.fetchIssueScopeCounts(user) : issueApi.getIssueScopeCounts(user)
  },

  kpiCounts(): Promise<{ total: number; byStatus: Record<string, number> }> {
    return isFixtureMode() ? issueFixtures.fetchIssueKpiCounts() : issueApi.getIssueKpiCounts()
  },
}

/** Notification reads and the two read-state writes. */
export const notifications = {
  list(query: NotificationQuery = {}): Promise<NotificationListResult> {
    return isFixtureMode() ? notificationFixtures.fetchNotifications(query) : notificationApi.listNotifications(query)
  },

  markRead(id: string): Promise<void> {
    return isFixtureMode() ? notificationFixtures.markNotificationRead(id) : notificationApi.markRead(id)
  },

  markAllRead(recipient?: string): Promise<void> {
    return isFixtureMode()
      ? notificationFixtures.markAllNotificationsRead(recipient)
      : notificationApi.markAllRead(recipient)
  },
}

/**
 * Every service, as one object.
 *
 * Exported so a test can assert the SET of services rather than each one — the
 * check that catches a service added to the folder and never wired in here,
 * which would otherwise be a module nobody can reach.
 */
export const services = { issues, notifications }
