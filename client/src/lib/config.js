// Central access point for Vite env variables (see client/.env.example).
export const config = Object.freeze({
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  socketUrl: import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000',
})
