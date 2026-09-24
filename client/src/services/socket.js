import { io } from 'socket.io-client'
import { config } from '@/lib/config'

// One Socket.IO connection per app session. Created after login and torn
// down on logout; components use it through hooks/useSocket.js.
let socket = null

export const connectSocket = (accessToken) => {
  if (socket) {
    socket.auth = { token: accessToken }
    if (!socket.connected) socket.connect()
    return socket
  }

  socket = io(config.socketUrl, {
    autoConnect: false,
    withCredentials: true,
    auth: { token: accessToken }, // verified server-side in Phase 7
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
