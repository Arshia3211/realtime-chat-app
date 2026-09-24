// Avatar, display name, username, bio and presence for a user.
// Placeholder structure — full implementation in Phase 4.
export default function ProfileCard({ user }) {
  return user ? (
    <div className="flex flex-col items-center gap-2 p-6 text-center">
      <p className="text-lg font-semibold">{user.displayName}</p>
      <p className="text-sm text-muted-foreground">@{user.username}</p>
    </div>
  ) : null
}
