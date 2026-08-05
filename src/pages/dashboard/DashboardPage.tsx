import { TaskToolbar } from '@/widgets/task-toolbar/TaskToolbar'
import { TaskBoard } from '@/widgets/task-board/TaskBoard'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  return (
    <section className={styles.root}>
      <h1 className={styles.heading}>Dashboard</h1>
      <TaskToolbar />
      <TaskBoard />
    </section>
  )
}
