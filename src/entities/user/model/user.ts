export const userTypes = ['ADMIN', 'CANDIDATE'] as const

export type UserType = (typeof userTypes)[number]

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
