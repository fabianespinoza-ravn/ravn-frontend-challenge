import { gql } from '@apollo/client'

export const GET_PROFILE = gql`
  query GetProfile {
    profile {
      id
      fullName
      email
      avatar
      type
      createdAt
      updatedAt
    }
  }
`

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      fullName
      email
      avatar
      type
      createdAt
      updatedAt
    }
  }
`
