# ADR 0005: Substitute the assignee filter for the brief's ownerId

- **Status:** Accepted
- **Date:** 2026-08-19

## Context

The challenge names `ownerId` among the task filters. The schema accepts the field and the API ignores it. Authenticated read-only verification on 2026-08-04 recorded two contracts: filtering by any of the four creators in the verified account, or by a UUID belonging to nobody, returns the complete nine-task set unchanged (5.11); an invalid UUID returns `BAD_USER_INPUT` with HTTP `400` and `ownerId must be a UUID`, so the field is validated but not applied (5.11). A control built on it would look like a filter and filter nothing.

## Decision

Leave `ownerId` out of `TaskFilterInput` entirely, so no control can be built on it by accident, and offer the assignee filter in its place. Assignee filters correctly, and answers an explicit `null` with the unassigned tasks — confirmed by creating a task without an assignee, finding it alone, and deleting it. Only the board offers the control: My Tasks already is the assignee filter, so a second one there would either contradict the route or do nothing.

## Consequences

The panel offers five of the six filters the challenge lists, and the sixth is absent deliberately and with evidence rather than by omission. Should the API begin honouring `ownerId`, the field returns to the input type and the panel gains a control; nothing else has to change. The absence is enforced by the type rather than by a comment, which is what keeps a later contributor from wiring a control to a filter that cannot filter.
