// Display helpers shared by the conversation list and chat header.

// The other participant of a one-to-one conversation.
export const getPeer = (conversation, currentUserId) =>
  conversation?.members?.find((member) => member.userId !== currentUserId)?.user ?? null

export const getConversationTitle = (conversation, currentUserId) => {
  if (!conversation) return ''
  if (conversation.type === 'GROUP') return conversation.name ?? 'Group'
  return getPeer(conversation, currentUserId)?.displayName ?? 'Deleted account'
}

// Object accepted by <UserAvatar user={…} /> (initials come from displayName).
export const getConversationAvatar = (conversation, currentUserId) => {
  if (conversation?.type === 'GROUP') {
    return { displayName: conversation.name ?? 'Group', avatarUrl: conversation.avatarUrl }
  }
  return getPeer(conversation, currentUserId) ?? { displayName: '?' }
}

// One-line preview of the latest message for the sidebar.
export const getLastMessagePreview = (conversation, currentUserId) => {
  const message = conversation?.lastMessage
  if (!message) return 'No messages yet'
  if (message.deletedAt) return 'Message deleted'

  const prefix = message.senderId === currentUserId ? 'You: ' : ''
  switch (message.type) {
    case 'IMAGE':
      return `${prefix}Photo`
    case 'FILE':
      return `${prefix}File`
    default:
      return `${prefix}${message.content ?? ''}`
  }
}
