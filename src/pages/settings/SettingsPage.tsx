import { formatMemberSince, getUserInitials, userTypeLabels } from '@/entities/user/model/user'
import { useProfile } from '@/entities/user/model/useProfile'
import { Avatar } from '@/shared/ui/avatar/Avatar'
import { Button } from '@/shared/ui/button/Button'
import styles from './SettingsPage.module.css'

const profileHeadingId = 'settings-profile-name'

/**
 * The authenticated user, read from the same `profile` query the shared header
 * uses, so the two can never disagree about who is signed in.
 *
 * There is nothing to edit here. The schema exposes only the three task
 * mutations, so the route is read-only because the API is, not by choice.
 */
export function SettingsPage() {
  const { data, error, loading, refetch } = useProfile()
  const profile = data?.profile
  const memberSince = profile ? formatMemberSince(profile.createdAt) : null

  return (
    <section className={styles.root}>
      <h1 className={styles.heading}>Settings</h1>

      {loading ? (
        <section aria-live="polite" className={styles.state} role="status">
          <h2>Loading profile</h2>
          <p>Fetching your account information.</p>
        </section>
      ) : null}

      {!loading && error ? (
        <section className={styles.state} role="alert">
          <h2>Unable to load your profile</h2>
          <p>Please check your connection and try again.</p>
          <Button onClick={() => void refetch()} type="button" variant="secondary">
            Retry
          </Button>
        </section>
      ) : null}

      {!loading && !error && profile ? (
        <article aria-labelledby={profileHeadingId} className={styles.card}>
          <Avatar
            alt={`${profile.fullName}, profile picture`}
            initials={getUserInitials(profile.fullName)}
            size="large"
            src={profile.avatar}
          />
          <h2 className={styles.name} id={profileHeadingId}>
            {profile.fullName}
          </h2>
          {/*
           * A description list rather than rows of text, so each value is
           * announced with the label it answers to.
           */}
          <dl className={styles.details}>
            <div className={styles.detail}>
              <dt>Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div className={styles.detail}>
              <dt>Position</dt>
              <dd>{userTypeLabels[profile.type]}</dd>
            </div>
            {/* Only when the stored value is a date we can actually name. */}
            {memberSince ? (
              <div className={styles.detail}>
                <dt>Member since</dt>
                <dd>{memberSince}</dd>
              </div>
            ) : null}
          </dl>
        </article>
      ) : null}
    </section>
  )
}
