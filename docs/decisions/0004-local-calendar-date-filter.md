# ADR 0004: Filter due dates by local calendar day in the client

- **Status:** Accepted
- **Date:** 2026-08-10

## Context

The API compares due dates as exact instants, while users select a calendar day. Tasks due on the same local day can have different stored times.

## Decision

Send all supported filters to `GET_TASKS`, but apply the selected due date locally after mapping tasks to presentation data.

## Consequences

The date filter matches the day users see rather than a single timestamp. This relies on the current API behavior of returning the complete requested task set without pagination; pagination would require a server-side calendar-day filter or another complete-result strategy.
