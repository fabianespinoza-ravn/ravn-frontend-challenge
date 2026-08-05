import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { getGraphqlConfig, type GraphqlConfig } from '@/shared/config/env'

export function createAuthorizationHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
  }
}

export function createApolloClient(config: GraphqlConfig = getGraphqlConfig()) {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      headers: createAuthorizationHeaders(config.token),
      uri: config.endpoint,
    }),
  })
}
