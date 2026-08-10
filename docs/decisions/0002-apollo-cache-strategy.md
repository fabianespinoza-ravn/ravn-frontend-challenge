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
