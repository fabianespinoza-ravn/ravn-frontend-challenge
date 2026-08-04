import { Grid2X2, List, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button/Button'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import styles from './TaskToolbar.module.css'

export function TaskToolbar() {
  return (
    <div className={styles.root}>
      <div className={styles.viewToggle} aria-label="Task view" role="group">
        <IconButton aria-label="List view" size="small">
          <List aria-hidden="true" size={18} />
        </IconButton>
        <IconButton aria-label="Board view" aria-pressed="true" size="small">
          <Grid2X2 aria-hidden="true" size={18} />
        </IconButton>
      </div>
      <Button aria-label="Add task" className={styles.addTaskButton} type="button">
        <Plus aria-hidden="true" size={19} />
      </Button>
    </div>
  )
}
