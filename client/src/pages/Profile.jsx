import AvatarUploader from '@/components/profile/AvatarUploader'
import EditProfileForm from '@/components/profile/EditProfileForm'
import ProfileCard from '@/components/profile/ProfileCard'
import { useAuthStore } from '@/stores/authStore'

export default function Profile() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto grid max-w-4xl gap-6 p-4 sm:p-6 lg:grid-cols-[18rem_1fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <h1 className="mb-4 text-2xl font-semibold">Profile</h1>
          <section className="rounded-xl border" aria-label="How others see you">
            <ProfileCard user={user} />
          </section>
          <p className="mt-2 text-center text-xs text-muted-foreground">This is how others see you.</p>
        </div>

        <div className="grid gap-6 lg:pt-12">
          <section className="rounded-xl border p-4 sm:p-6">
            <h2 className="mb-4 font-medium">Profile photo</h2>
            <AvatarUploader />
          </section>

          <section className="rounded-xl border p-4 sm:p-6">
            <h2 className="mb-4 font-medium">Details</h2>
            <EditProfileForm />
          </section>

          <section className="rounded-xl border p-4 sm:p-6">
            <h2 className="mb-1 font-medium">Email</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
