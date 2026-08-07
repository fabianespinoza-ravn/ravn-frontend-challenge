import { ApolloProvider } from '@apollo/client/react'
import { useMemo, type ReactNode } from 'react'
import { createApolloClient } from '@/shared/api/graphql/apolloClient'

type ApolloAppProviderProps = {
  children: ReactNode
}

export function ApolloAppProvider({ children }: ApolloAppProviderProps) {
  const client = useMemo(() => createApolloClient(), [])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
