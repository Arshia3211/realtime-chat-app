import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center p-4 text-center">
      <div className="flex flex-col items-center gap-3">
        <p className="text-5xl font-bold">404</p>
        <p className="text-muted-foreground">This page does not exist.</p>
        <Link to="/" className="text-sm underline">Go home</Link>
      </div>
    </div>
  )
}
