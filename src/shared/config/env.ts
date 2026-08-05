type EnvironmentValues = {
  VITE_GRAPHQL_ENDPOINT?: string
  VITE_GRAPHQL_TOKEN?: string
}

export type GraphqlConfig = {
  endpoint: string
  token: string
}

function getRequiredValue(environment: EnvironmentValues, key: keyof EnvironmentValues) {
  const value = environment[key]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

export function getGraphqlConfig(
  environment: EnvironmentValues = import.meta.env as EnvironmentValues,
): GraphqlConfig {
  return {
    endpoint: getRequiredValue(environment, 'VITE_GRAPHQL_ENDPOINT'),
    token: getRequiredValue(environment, 'VITE_GRAPHQL_TOKEN'),
  }
}
