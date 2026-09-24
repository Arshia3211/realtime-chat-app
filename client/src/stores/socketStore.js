import { create } from 'zustand'

// Connection status only. The socket instance itself lives in services/socket.js
// (it is not serializable state and should not trigger re-renders).
export const useSocketStore = create((set) => ({
  isConnected: false,
  connectionError: null,

  setConnected: (isConnected) => set({ isConnected, ...(isConnected && { connectionError: null }) }),
  setConnectionError: (connectionError) => set({ connectionError }),
}))
