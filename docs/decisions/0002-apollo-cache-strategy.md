# ADR 0002: Apollo cache strategy for task mutations

- **Status:** Accepted
- **Date:** 2026-08-10

## Context

Task lists can be filtered by API-owned rules, while task entities appear in more than one view. A single cache rule would either duplicate server filtering logic or cause unnecessary requests.

## Decision

- Create tasks and refetch active `GET_TASKS` queries.
- Update normalized task entities from the `UPDATE_TASK` response; also refetch when assignee changes.
- Evict deleted tasks and run cache garbage collection.

## Consequences

Creation and reassignment pay an intentional network round trip to keep filtered membership correct. Ordinary edits and deletes update active views promptly without manually rewriting every cached query.

## Verification

Measured on 2026-08-19 against the live API with `@apollo/client 4.2.10`, instrumenting `fetch` at the transport layer: a deletion emits exactly one request, the mutation itself. With three `tasks` fields cached concurrently — no filter, an assignee filter, and a status-and-tags filter — all three release the deleted task without any network activity, and the watching query never enters a loading state. A variant that removes the reference from each `tasks` field with `cache.modify` before evicting produces the same single request, so the eviction alone is sufficient and the additional step buys nothing.

This holds for the cache implementation at this version rather than for the API: a change in how Apollo reads dangling references from list fields would invalidate it, while a change in the API would not.
