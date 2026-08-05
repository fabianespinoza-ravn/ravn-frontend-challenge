import { mockTasks } from '@/entities/task/model/mockTasks'
import { mockCurrentUser } from '@/entities/user/model/mockCurrentUser'
import { TaskList } from '@/widgets/task-list/TaskList'
import { TaskToolbar } from '@/widgets/task-toolbar/TaskToolbar'
import styles from './MyTasksPage.module.css'

export function MyTasksPage() {
  const assignedTasks = mockTasks.filter((task) => task.assignee?.id === mockCurrentUser.id)

  return (
    <section className={styles.root}>
      <TaskToolbar activeView="list" />
      <TaskList tasks={assignedTasks} />
    </section>
  )
}
