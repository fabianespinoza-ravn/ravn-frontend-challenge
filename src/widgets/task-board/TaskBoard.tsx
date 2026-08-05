import { mockTasks } from '@/entities/task/model/mockTasks'
import { taskStatuses } from '@/entities/task/model/task'
import { TaskColumn } from './TaskColumn'
import styles from './TaskBoard.module.css'

export function TaskBoard() {
  return (
    <section aria-label="Task board" className={styles.root}>
      {taskStatuses.map((status) => {
        const tasks = mockTasks
          .filter((task) => task.status === status.value)
          .sort((firstTask, secondTask) => firstTask.dueDate.localeCompare(secondTask.dueDate))

        return (
          <TaskColumn color={status.color} key={status.value} name={status.label} tasks={tasks} />
        )
      })}
    </section>
  )
}
