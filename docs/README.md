# Documentation

This directory contains the maintained technical documentation for the task-management application.

| Document                                                         | Purpose                                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [Architecture](architecture.md)                                  | UI layers, route composition and domain boundaries.                       |
| [API and state](api-and-state.md)                                | GraphQL operations, Apollo cache and task workflows.                      |
| [Responsive design](responsive-design.md)                        | Desktop, Android and iOS-oriented layouts.                                |
| [Development](development.md)                                    | Local setup, quality checks, testing and delivery workflow.               |
| [Decisions](decisions/)                                          | Short Architecture Decision Records (ADRs) for durable technical choices. |
| [Historical implementation plan](history/implementation-plan.md) | Original phased plan and detailed decision log.                           |

## Documentation policy

- Keep the README focused on product capabilities, screenshots and quick start.
- Update the maintained guides when an implementation contract changes.
- Add an ADR when a decision has meaningful alternatives or affects multiple areas of the codebase.
- Preserve the historical plan; do not use it as the source of truth for current status.
- Keep documentation, code comments and user-facing product text in English.
