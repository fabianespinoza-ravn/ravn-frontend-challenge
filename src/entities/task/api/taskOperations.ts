import { gql } from '@apollo/client'

export const TASK_FIELDS = gql`
  fragment TaskFields on Task {
    id
    name
    dueDate
    pointEstimate
    position
    status
    tags
    createdAt
    assignee {
      id
      fullName
      email
      avatar
      type
    }
    creator {
      id
      fullName
      email
      avatar
      type
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
