import ProfileCard from '@/components/profile/ProfileCard'
import { useAuthStore } from '@/stores/authStore'

export default function Profile() {
  const user = useAuthStore((state) => state.user)

  // Phase 4: editable profile form (display name, bio, avatar upload).
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Profile</h1>
      <div className="rounded-xl border">
        <ProfileCard user={user} />
      </div>
    </div>
  )
}
