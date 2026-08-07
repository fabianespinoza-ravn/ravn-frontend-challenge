import { Grid2X2, List, Plus } from 'lucide-react'
import { useTaskCreation } from '@/features/task-creation/model/useTaskCreation'
import { Button } from '@/shared/ui/button/Button'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import styles from './TaskToolbar.module.css'

type TaskToolbarProps = {
  activeView?: 'board' | 'list'
}

export function TaskToolbar({ activeView = 'board' }: TaskToolbarProps) {
  const { openTaskCreation } = useTaskCreation()

  return (
    <div className={styles.root}>
      <div className={styles.viewToggle} aria-label="Task view" role="group">
        <IconButton
          aria-label="Task view"
          aria-pressed={activeView === 'list'}
          className={styles.listButton}
          size="small"
        >
          <List aria-hidden="true" size={18} />
          <span className={styles.viewLabel}>Task</span>
        </IconButton>
        <IconButton
          aria-label="Dashboard view"
          aria-pressed={activeView === 'board'}
          className={styles.boardButton}
          size="small"
        >
          <Grid2X2 aria-hidden="true" size={18} />
          <span className={styles.viewLabel}>Dashboard</span>
        </IconButton>
      </div>
      <Button
        aria-label="Add task"
        className={styles.addTaskButton}
        onClick={openTaskCreation}
        type="button"
      >
        <Plus aria-hidden="true" size={19} />
      </Button>
    </div>
  )
}
