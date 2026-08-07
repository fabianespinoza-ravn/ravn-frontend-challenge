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

export function getUserInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0]?.toUpperCase())
    .join('')
}
