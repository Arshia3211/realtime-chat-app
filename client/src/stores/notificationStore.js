import { create } from 'zustand'

const countUnread = (notifications) => notifications.filter((n) => !n.isRead).length

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => set({ notifications, unreadCount: countUnread(notifications) }),

  addNotification: (notification) =>
    set((state) => {
      const notifications = [notification, ...state.notifications]
      return { notifications, unreadCount: countUnread(notifications) }
    }),

  markAsRead: (notificationId) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n,
      )
      return { notifications, unreadCount: countUnread(notifications) }
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}))
