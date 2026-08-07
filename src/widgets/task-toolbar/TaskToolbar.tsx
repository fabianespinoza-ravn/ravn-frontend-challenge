import { Grid2X2, List, Plus } from 'lucide-react'
import { TaskFiltersPanel } from '@/features/task-filters/ui/TaskFiltersPanel'
import { useTaskFormContext } from '@/features/task-form/model/useTaskFormContext'
import { Button } from '@/shared/ui/button/Button'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import styles from './TaskToolbar.module.css'

export type TaskView = 'board' | 'list'

type TaskToolbarProps = {
  activeView?: TaskView
  /* Only the board offers it; My Tasks already is the assignee filter. */
  hasAssigneeFilter?: boolean
  /*
   * Absent on a surface that shows one presentation only, where the controls
   * stay as the reference draws them but report that they lead nowhere.
   */
  onSelectView?: (view: TaskView) => void
}

export function TaskToolbar({
  activeView = 'board',
  hasAssigneeFilter,
  onSelectView,
}: TaskToolbarProps) {
  const { openTaskForm } = useTaskFormContext()

  return (
    <div className={styles.root}>
      <div className={styles.viewToggle} aria-label="Task view" role="group">
        <IconButton
          aria-label="Task view"
          aria-pressed={activeView === 'list'}
          className={styles.listButton}
          disabled={!onSelectView}
          onClick={() => onSelectView?.('list')}
          size="small"
        >
          <List aria-hidden="true" size={18} />
          <span className={styles.viewLabel}>Task</span>
        </IconButton>
        <IconButton
          aria-label="Dashboard view"
          aria-pressed={activeView === 'board'}
          className={styles.boardButton}
          disabled={!onSelectView}
          onClick={() => onSelectView?.('board')}
          size="small"
        >
          <Grid2X2 aria-hidden="true" size={18} />
          <span className={styles.viewLabel}>Dashboard</span>
        </IconButton>
      </div>
      <TaskFiltersPanel hasAssigneeFilter={hasAssigneeFilter} />
      <Button
        aria-label="Add task"
        className={styles.addTaskButton}
        onClick={openTaskForm}
        type="button"
      >
        <Plus aria-hidden="true" size={19} />
      </Button>
    </div>
  )
}
