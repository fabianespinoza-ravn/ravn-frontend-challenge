export const userTypes = ['ADMIN', 'CANDIDATE'] as const

export type UserType = (typeof userTypes)[number]

/**
 * The challenge calls this the user's Position, and the API answers it as an
 * enum. The wording lives beside the type for the same reason the task labels
 * do (5.20): one source, so no view spells it its own way.
 */
export const userTypeLabels: Record<UserType, string> = {
  ADMIN: 'Admin',
  CANDIDATE: 'Candidate',
}

export type User = {
  avatar: string | null
  createdAt: string
  email: string
  fullName: string
  id: string
  type: UserType
  updatedAt: string
}

const memberSinceParts = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
})

/**
 * `August 2026`, the month an account was opened.
 *
 * Read in UTC, unlike a task's due date, which 5.45 reduces to the viewer's own
 * calendar day so that `Today` means today for them. This value names a moment
 * in the account's history rather than a day in the reader's, so it is read in
 * the timezone it was stored in; formatting it locally would move an account
 * created near a month boundary into the neighbouring month depending on who
 * was looking.
 */
export function formatMemberSince(createdAt: string) {
  const date = new Date(createdAt)

  return Number.isNaN(date.getTime()) ? null : memberSinceParts.format(date)
}

export function getUserInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase())
    .join('')
}
