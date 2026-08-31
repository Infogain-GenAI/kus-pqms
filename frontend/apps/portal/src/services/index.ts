import { isFixtureMode } from '@/config/data-source'
import * as issueFixtures from '@/api/issues'
import * as notificationFixtures from '@/api/notifications'
import * as issueApi from './issue.service'
import * as notificationApi from './notification.service'
import * as issueDetailFixtures from '@/api/issueDetail'
import * as issueDetailApi from './issueDetail.service'
import * as masterDataFixtures from '@/api/masterData'
import * as masterDataApi from './masterData.service'
import type { IssueListQuery, IssueListResult } from '@/api/issues'
import type { NotificationListResult, NotificationQuery } from '@/api/notifications'
import type {
  ActivityChangeRequest,
  AuditEntry,
  ClassLevel,
  ClassificationNode,
  Comment,
  InvestigationActivity,
  Issue,
  IssuePriority,
  PartRequest,
  User,
} from '@/data/types'
import type { PartOption, TeamMember } from '@/data/investigation'

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

  /**
   * ⚠️ `recipient` IS THE BACKEND'S OWNERSHIP CHECK ON THE REAL PATH, not a
   * filter — see `notification.service.ts`. Optional in this signature only
   * because the fixture path has no notion of ownership yet; once identity
   * lands it should become required, and the call site already passes it.
   */
  markRead(id: string, recipient?: string): Promise<void> {
    return isFixtureMode()
      ? notificationFixtures.markNotificationRead(id)
      : notificationApi.markRead(id, recipient)
  },

  /** The badge's own count. Never derived from a page — see the service. */
  unreadCount(recipient?: string): Promise<number> {
    return isFixtureMode()
      ? notificationFixtures.fetchUnreadNotificationCount(recipient)
      : notificationApi.unreadCount(recipient)
  },

  markAllRead(recipient?: string): Promise<void> {
    return isFixtureMode()
      ? notificationFixtures.markAllNotificationsRead(recipient)
      : notificationApi.markAllRead(recipient)
  },
}


/**
 * ─── ISSUE-DETAIL COLLECTIONS ────────────────────────────────────────────────
 *
 * Parts, comments, investigation activities, activity change requests and the
 * audit trail — the five collections that hang off one issue.
 *
 * ⚠️ THE FIXTURE ARM READS THE SEED; THE STORE HOLDS A MUTATED COPY. A part
 * added through `data/store.tsx` is not visible through here, so no screen has
 * been moved onto these yet. That gap closes when MSW handlers are built from
 * the fixture modules (26 F-07) and does NOT affect the real arm, where the
 * backend is the only source.
 */
export const issueDetail = {
  parts(issueId: string): Promise<PartRequest[]> {
    return isFixtureMode()
      ? issueDetailFixtures.fetchPartRequests(issueId)
      : issueDetailApi.listPartRequests(issueId)
  },

  comments(issueId: string): Promise<Comment[]> {
    return isFixtureMode()
      ? issueDetailFixtures.fetchComments(issueId)
      : issueDetailApi.listComments(issueId)
  },

  activities(issueId: string): Promise<InvestigationActivity[]> {
    return isFixtureMode()
      ? issueDetailFixtures.fetchActivities(issueId)
      : issueDetailApi.listActivities(issueId)
  },

  changeRequests(activityId: string): Promise<ActivityChangeRequest[]> {
    return isFixtureMode()
      ? issueDetailFixtures.fetchActivityChangeRequests(activityId)
      : issueDetailApi.listActivityChangeRequests(activityId)
  },

  audit(issueId: string): Promise<AuditEntry[]> {
    return isFixtureMode()
      ? issueDetailFixtures.fetchAuditTrail(issueId)
      : issueDetailApi.listAuditTrail(issueId)
  },
}

/**
 * ─── REFERENCE DATA ──────────────────────────────────────────────────────────
 *
 * ⚠️ SERVER STATE, NOT STARTUP STATE. Fetched once and rarely changed, which
 * makes it feel like something to load at boot and keep in a store. 04
 * classifies by ownership rather than lifetime, so these are queries with a long
 * `staleTime`. A store here would be a second cache with no invalidation path.
 */
export const masterData = {
  classification(): Promise<ClassificationNode[]> {
    return isFixtureMode()
      ? masterDataFixtures.fetchClassification()
      : masterDataApi.listClassification()
  },

  classificationLevel(level: ClassLevel, parentId?: string): Promise<ClassificationNode[]> {
    return isFixtureMode()
      ? masterDataFixtures.fetchClassificationLevel(level, parentId)
      : masterDataApi.listClassificationLevel(level, parentId)
  },

  partOptions(): Promise<PartOption[]> {
    return isFixtureMode() ? masterDataFixtures.fetchPartOptions() : masterDataApi.listPartOptions()
  },

  teamDirectory(): Promise<TeamMember[]> {
    return isFixtureMode()
      ? masterDataFixtures.fetchTeamDirectory()
      : masterDataApi.listTeamDirectory()
  },

  users(): Promise<User[]> {
    return isFixtureMode() ? masterDataFixtures.fetchUsers() : masterDataApi.listUsers()
  },

  priority(issueId: string): Promise<IssuePriority> {
    return isFixtureMode()
      ? masterDataFixtures.fetchIssuePriority(issueId)
      : masterDataApi.getIssuePriority(issueId)
  },

  vinOptions(issueId: string): Promise<string[]> {
    return isFixtureMode()
      ? masterDataFixtures.fetchVinOptions(issueId)
      : masterDataApi.listVinOptions(issueId)
  },
}

/**
 * Every service, as one object.
 *
 * Exported so a test can assert the SET of services rather than each one — the
 * check that catches a service added to the folder and never wired in here,
 * which would otherwise be a module nobody can reach.
 *
 * ⚠️ DECLARED LAST, AFTER EVERY MEMBER. `const` is block-scoped and not hoisted,
 * so referencing `issueDetail` above its declaration is a TypeScript error and
 * would be a runtime TDZ throw at module load. Keep this at the bottom of the
 * file and add new services above it.
 */
export const services = { issues, notifications, issueDetail, masterData }
