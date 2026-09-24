import ProfileCard from './ProfileCard'

// Modal showing another user profile (built on shadcn/ui Dialog).
// Placeholder structure — full implementation in Phase 4.
export default function ProfileDialog({ user, open, onOpenChange }) {
  return open ? (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/50" onClick={() => onOpenChange?.(false)}>
      <div className="rounded-lg bg-background shadow-lg" onClick={(event) => event.stopPropagation()}>
        <ProfileCard user={user} />
      </div>
    </div>
  ) : null
}
