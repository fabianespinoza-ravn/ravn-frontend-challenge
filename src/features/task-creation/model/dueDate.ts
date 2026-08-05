export const shortMonthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export const longMonthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/**
 * The draft keeps a local `YYYY-MM-DD` value. Building it from local date parts
 * avoids the timezone shift that `toISOString` introduces west of UTC.
 */
export function toDueDateValue(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

export function parseDueDateValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return null
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))

  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDueDateLabel(value: string) {
  const date = parseDueDateValue(value)

  if (!date) {
    return null
  }

  return `${shortMonthNames[date.getMonth()]}. ${date.getDate()} ${date.getFullYear()}`
}

export function formatMonthLabel(year: number, month: number) {
  return `${longMonthNames[month]} ${year}`
}

export function formatFullDateLabel(date: Date) {
  return `${longMonthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

/**
 * Six full weeks starting on Sunday, so the grid keeps a stable height while
 * the visible month changes.
 */
export function getCalendarDays(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1)
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    return new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index)
  })
}
