# API and state

## API client

`createApolloClient` configures an `HttpLink` with `VITE_GRAPHQL_ENDPOINT` and a Bearer token from `VITE_GRAPHQL_TOKEN`. `InMemoryCache` normalizes GraphQL entities so task results sharing an id reference the same cached task.

Required variables are validated in `shared/config/env.ts`; credentials belong only in `.env.local` and must not be committed.

## Operations

| Operation     | Consumer                           | Purpose                    |
| ------------- | ---------------------------------- | -------------------------- |
| `GET_TASKS`   | Dashboard and My Tasks hooks       | Read filtered tasks.       |
| `GET_PROFILE` | Header, Settings and My Tasks      | Read authenticated user.   |
| `GET_USERS`   | Open task form and assignee filter | Read assignable users.     |
| `CREATE_TASK` | Task form                          | Create a validated draft.  |
| `UPDATE_TASK` | Task form                          | Update an existing task.   |
| `DELETE_TASK` | Delete confirmation                | Permanently remove a task. |

All task mutations return `TaskFields`, allowing Apollo to normalize the updated entity.

## Task reading workflow

`useDashboardTasks` and `useAssignedTasks` read filters from `TaskFiltersContext`, build GraphQL variables, call Apollo `useQuery`, sort results by due date, map `ApiTask` to presentation `Task`, and finally render `TaskBoard` or `TaskList`.

- Dashboard queries all available tasks.
- My Tasks waits for `GET_PROFILE`, then queries with `assigneeId = profile.id`.
- Name, status, estimate, tags and assignee filtering are performed by the API.
- Due date is filtered locally by calendar day because the API compares exact instants.
- `previousData` remains visible during later requests, distinguishing first-load `isLoading` from non-blocking `isRefreshing`.

## Mutation workflow

| Mutation | Cache strategy                                                                            | Reason                                                                      |
| -------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Create   | `refetchQueries: [GET_TASKS]`                                                             | The server decides whether a new task belongs to each active filtered list. |
| Update   | Normalized cache update from returned task. Re-fetch `GET_TASKS` if the assignee changes. | A reassignment can move a task into or out of My Tasks.                     |
| Delete   | `cache.evict(cache.identify(deleteTask))` followed by `cache.gc()`.                       | A deleted task belongs in no cached list.                                   |

There are no optimistic mutations. During a request, submission controls are disabled. Failed form and delete operations retain their draft or confirmation state and surface an error for retry.

## Client state

Remote data is owned by Apollo. Local UI state is intentionally narrow:

- `useTaskFormState` owns values, validation attempt state and derived missing fields.
- `TaskFiltersContext` owns active filters; text search is debounced by 300 ms.
- Page-local `view` state switches between board and list without refetching.
- Dropdown, menu and picker open state remains local to its component.

See [ADR 0002](decisions/0002-apollo-cache-strategy.md) for the cache rationale.
