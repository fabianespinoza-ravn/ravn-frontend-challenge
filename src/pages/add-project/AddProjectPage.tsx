import { CalendarDays, Calculator, Tag, UserRound, X } from 'lucide-react'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import styles from './AddProjectPage.module.css'

const projectFields = [
  { icon: Calculator, label: 'Estimate' },
  { icon: Tag, label: 'Label' },
  { icon: UserRound, label: 'Assignee' },
  { icon: CalendarDays, label: 'Due Date' },
]

type AddProjectPageProps = {
  onClose: () => void
}

export function AddProjectPage({ onClose }: AddProjectPageProps) {
  return (
    <section className={styles.root}>
      <header className={styles.actionBar}>
        <IconButton aria-label="Close Add Project" onClick={onClose} size="small">
          <X aria-hidden="true" size={20} />
        </IconButton>
        <button className={styles.createButton} type="button">
          Create
        </button>
      </header>
      <h1>Task Title</h1>
      <div className={styles.fields} aria-label="Add Project fields">
        {projectFields.map(({ icon: Icon, label }) => (
          <button className={styles.field} key={label} type="button">
            <Icon aria-hidden="true" size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
