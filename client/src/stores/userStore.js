import { create } from 'zustand'

// Other users: presence and a cache of fetched profiles.
export const useUserStore = create((set) => ({
  onlineUserIds: [],
  usersById: {},

  setOnlineUsers: (onlineUserIds) => set({ onlineUserIds }),
  setUserOnline: (userId) =>
    set((state) =>
      state.onlineUserIds.includes(userId) ? state : { onlineUserIds: [...state.onlineUserIds, userId] },
    ),
  setUserOffline: (userId) =>
    set((state) => ({ onlineUserIds: state.onlineUserIds.filter((id) => id !== userId) })),

  cacheUsers: (users) =>
    set((state) => ({
      usersById: { ...state.usersById, ...Object.fromEntries(users.map((user) => [user.id, user])) },
    })),
}))
