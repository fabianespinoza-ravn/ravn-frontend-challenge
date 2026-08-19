# API and state

## API client

`createApolloClient` configures an `HttpLink` with `VITE_GRAPHQL_ENDPOINT` and a Bearer token from `VITE_GRAPHQL_TOKEN`. `InMemoryCache` normalizes GraphQL entities so task results sharing an id reference the same cached task.

Required variables are validated in `shared/config/env.ts`; credentials belong only in `.env.local` and must not be committed.

## Operations

| Operation     | Consumer                           | Purpose                    |
| ------------- | ---------------------------------- | -------------------------- |
| `GET_TASKS`   | `useFilteredTasks`, for both views | Read filtered tasks.       |
| `GET_PROFILE` | Header, Settings and My Tasks      | Read authenticated user.   |
| `GET_USERS`   | Open task form and assignee filter | Read assignable users.     |
| `CREATE_TASK` | Task form                          | Create a validated draft.  |
| `UPDATE_TASK` | Task form                          | Update an existing task.   |
| `DELETE_TASK` | Delete confirmation                | Permanently remove a task. |

All task mutations return `TaskFields`, allowing Apollo to normalize the updated entity.

`TaskFields` selects only what the mapper reads. The creator, position, creation timestamp and
the assignee's contact fields were requested and never used, and are no longer asked for; the
response types narrow with the fragment, so a fixture describing a wider response fails to
compile. `GET_PROFILE` and `GET_USERS` no longer request `updatedAt`, which no mutation can
change: the schema's only mutations are `createTask`, `updateTask` and `deleteTask`.

## Task reading workflow

`useFilteredTasks` reads filters from `TaskFiltersContext`, builds GraphQL variables, calls Apollo
`useQuery`, sorts results by due date, maps `ApiTask` to presentation `Task`, and hands them to
`TaskBoard` or `TaskList`. Both views share it; the one thing they differ in is its argument.

- Dashboard calls it directly and queries all available tasks.
- My Tasks wraps it in `useAssignedTasks`, which waits for `GET_PROFILE`, supplies
  `assigneeId = profile.id`, and retries both queries. The shared hook exposes `loading` and
  `hasPreviousData` beside its derived flags so a caller waiting on something else can decide
  what counts as loading.
- Name, status, estimate, tags and assignee filtering are performed by the API.
- Due date is filtered locally by calendar day because the API compares exact instants.
- `previousData` remains visible during later requests, distinguishing first-load `isLoading` from non-blocking `isRefreshing`.

## Mutation workflow

| Mutation | Cache strategy                                                                            | Reason                                                                               |
| -------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Create   | `refetchQueries: [GET_TASKS]`                                                             | The server decides whether a new task belongs to each active filtered list.          |
| Update   | Normalized cache update from returned task. Re-fetch `GET_TASKS` if the assignee changes. | A reassignment can move a task into or out of My Tasks.                              |
| Delete   | `cache.evict(cache.identify(deleteTask))` followed by `cache.gc()`.                       | A deleted task belongs in no cached list. Measured to cost no refetch; see ADR 0002. |

There are no optimistic mutations. During a request, submission controls are disabled.

Feedback occupies two regions with different urgencies. Failure keeps `role="alert"`: a failed
form or deletion retains its draft or confirmation state and surfaces an error naming the
operation that failed. Success uses a `role="status"` region held by the layout (`StatusToast`, driven by `useTransientStatus`), which announces
a created, updated or deleted task after its surface closes. That region is mounted from the
first render, since a live region introduced together with its first message is not reliably
announced, and each announcement carries an incrementing key so the same sentence twice is read
twice. The views carry a second such region (`LiveAnnouncement`) for a filter that matched nothing, which otherwise
replaced what was on screen in silence.

## Client state

Remote data is owned by Apollo. Local UI state is intentionally narrow:

- `useTaskFormState` owns values, validation attempt state and derived missing fields.
- `useTaskFiltersState` provides `TaskFiltersContext`; text search is debounced by 300 ms.
- Page-local `view` state switches between board and list without refetching.
- Each dropdown, menu and picker keeps its own open state, through the shared `useDisclosure`:
  outside press, Escape in the capture phase, and focus returned to the trigger.

See [ADR 0002](decisions/0002-apollo-cache-strategy.md) for the cache rationale.
