import { taskStatuses, type Task } from '@/entities/task/model/task'
import { TaskColumn } from './TaskColumn'
import styles from './TaskBoard.module.css'

type TaskBoardProps = {
  tasks: Task[]
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  return (
    <section aria-label="Task board" className={styles.root}>
      {taskStatuses.map((status) => {
        const statusTasks = tasks.filter((task) => task.status === status.value)

        return (
          <TaskColumn
            color={status.color}
            key={status.value}
            name={status.label}
            tasks={statusTasks}
          />
        )
      })}
    </section>
  )
}
