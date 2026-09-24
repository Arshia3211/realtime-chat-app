import { useEffect, useRef } from 'react'
import { SOCKET_EVENTS } from '@/lib/socketEvents'
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket'
import { useAuthStore } from '@/stores/authStore'
import { useSocketStore } from '@/stores/socketStore'

// Opens the socket while the user is authenticated and mirrors its
// connection status into socketStore. Mount once, in ProtectedLayout.
export function useSocketConnection() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setConnected = useSocketStore((state) => state.setConnected)
  const setConnectionError = useSocketStore((state) => state.setConnectionError)

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return undefined

    const socket = connectSocket(accessToken)
    socket.on(SOCKET_EVENTS.CONNECT, () => setConnected(true))
    socket.on(SOCKET_EVENTS.DISCONNECT, () => setConnected(false))
    socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => setConnectionError(error.message))

    return () => {
      disconnectSocket()
      setConnected(false)
    }
  }, [isAuthenticated, accessToken, setConnected, setConnectionError])
}

// Subscribes to a socket event for the lifetime of the component.
// Always calls the latest handler without re-subscribing on every render.
export function useSocketEvent(event, handler) {
  const isConnected = useSocketStore((state) => state.isConnected)
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return undefined

    const listener = (...args) => handlerRef.current(...args)
    socket.on(event, listener)
    return () => {
      socket.off(event, listener)
    }
  }, [event, isConnected])
}

// Emits an event if the socket is connected. Returns false when it could not send.
export function emitSocketEvent(event, payload, ack) {
  const socket = getSocket()
  if (!socket?.connected) return false
  socket.emit(event, payload, ack)
  return true
}
