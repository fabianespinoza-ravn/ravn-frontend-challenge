import { gql } from '@apollo/client'

export const TASK_FIELDS = gql`
  fragment TaskFields on Task {
    id
    name
    dueDate
    pointEstimate
    status
    tags
    assignee {
      id
      fullName
    }
  }
`

export const GET_TASKS = gql`
  query GetTasks($input: FilterTaskInput!) {
    tasks(input: $input) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`

export const UPDATE_TASK = gql`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`

/* `deleteTask` returns the task it removed, so it selects the same fields. */
export const DELETE_TASK = gql`
  mutation DeleteTask($input: DeleteTaskInput!) {
    deleteTask(input: $input) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`
