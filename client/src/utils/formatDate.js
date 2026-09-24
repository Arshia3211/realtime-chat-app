import { format, formatDistanceToNowStrict, isToday, isYesterday } from 'date-fns'

// Today: time only. Yesterday: the word. Older: the date.
export const formatConversationTime = (date) => {
  const value = new Date(date)
  if (isToday(value)) return format(value, 'HH:mm')
  if (isYesterday(value)) return 'Yesterday'
  return format(value, 'dd/MM/yyyy')
}

export const formatMessageTime = (date) => format(new Date(date), 'HH:mm')

// Presence text, e.g. last seen 5 minutes ago.
export const formatLastSeen = (date) => `${formatDistanceToNowStrict(new Date(date))} ago`
