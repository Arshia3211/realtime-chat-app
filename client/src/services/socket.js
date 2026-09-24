import { io } from 'socket.io-client'
import { config } from '@/lib/config'
import { useAuthStore } from '@/stores/authStore'

// One Socket.IO connection per signed-in session. Created after login and torn
// down on logout; components use it through hooks/useSocket.js.
let socket = null

export const connectSocket = () => {
  if (socket) {
    if (!socket.connected) socket.connect()
    return socket
  }

  socket = io(config.socketUrl, {
    autoConnect: false,
    withCredentials: true,
    // Evaluated on every (re)connect, so a refreshed access token is picked up
    // without tearing the socket down. Verified server-side in Phase 7.
    auth: (cb) => cb({ token: useAuthStore.getState().accessToken }),
  })
  socket.connect()
  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (!socket) return
  socket.removeAllListeners()
  socket.disconnect()
  socket = null
}
