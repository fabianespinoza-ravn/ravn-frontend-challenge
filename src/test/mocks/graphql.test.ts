import { describe, expect, it } from 'vitest'
import { createGraphqlMocks } from './graphql'

describe('createGraphqlMocks', () => {
  it('provides reusable mocks for the foundation queries', () => {
    expect(createGraphqlMocks()).toHaveLength(3)
  })
})
