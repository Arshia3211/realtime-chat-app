import { differenceInMinutes, format, formatDistanceToNowStrict, isSameDay, isThisYear, isToday, isYesterday } from 'date-fns'

// Today: time only. Yesterday: the word. Older: the date.
export const formatConversationTime = (date) => {
  const value = new Date(date)
  if (isToday(value)) return format(value, 'HH:mm')
  if (isYesterday(value)) return 'Yesterday'
  return format(value, 'dd/MM/yyyy')
}

export const formatMessageTime = (date) => format(new Date(date), 'HH:mm')

// Separator between days in a conversation: "Today", "Yesterday", "Monday, 3 March" or "3 March 2025".
export const formatDayLabel = (date) => {
  const value = new Date(date)
  if (isToday(value)) return 'Today'
  if (isYesterday(value)) return 'Yesterday'
  return format(value, isThisYear(value) ? 'EEEE, d MMMM' : 'd MMMM yyyy')
}

export const isDifferentDay = (a, b) => !isSameDay(new Date(a), new Date(b))

export const minutesBetween = (a, b) => Math.abs(differenceInMinutes(new Date(b), new Date(a)))

// Presence text, e.g. last seen 5 minutes ago.
export const formatLastSeen = (date) => `${formatDistanceToNowStrict(new Date(date))} ago`
