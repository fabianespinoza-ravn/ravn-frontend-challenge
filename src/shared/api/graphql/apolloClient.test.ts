import { ApolloClient } from '@apollo/client'
import { describe, expect, it } from 'vitest'
import { createApolloClient, createAuthorizationHeaders } from './apolloClient'

describe('Apollo client foundation', () => {
  it('creates the authorization header expected by the API', () => {
    expect(createAuthorizationHeaders('test-token')).toEqual({ authorization: 'Bearer test-token' })
  })

  it('creates an Apollo Client from explicit configuration', () => {
    const client = createApolloClient({
      endpoint: 'https://api.example.com/graphql',
      token: 'test-token',
    })

    expect(client).toBeInstanceOf(ApolloClient)
  })
})
