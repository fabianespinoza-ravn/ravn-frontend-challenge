import { describe, expect, it } from 'vitest'
import { getGraphqlConfig } from './env'

describe('getGraphqlConfig', () => {
  it('returns trimmed GraphQL configuration values', () => {
    expect(
      getGraphqlConfig({
        VITE_GRAPHQL_ENDPOINT: ' https://api.example.com/graphql ',
        VITE_GRAPHQL_TOKEN: ' test-token ',
      }),
    ).toEqual({
      endpoint: 'https://api.example.com/graphql',
      token: 'test-token',
    })
  })

  it('reports a missing required value', () => {
    expect(() =>
      getGraphqlConfig({ VITE_GRAPHQL_ENDPOINT: 'https://api.example.com/graphql' }),
    ).toThrow('Missing required environment variable: VITE_GRAPHQL_TOKEN')
  })
})
