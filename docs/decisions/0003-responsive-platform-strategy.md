# ADR 0003: Combine breakpoint and platform-aware presentation

- **Status:** Accepted
- **Date:** 2026-08-10

## Context

The supplied experience has different mobile navigation and date-picker conventions for Android and iOS, while desktop requires a different form container.

## Decision

Use one responsive web app with a shared `768px` layout breakpoint and `getMobilePlatform()` for Android/iOS conventions. Keep routes, domain data and mutation workflows shared across presentations.

## Consequences

The implementation avoids duplicate native-style code paths. The layout owns the shared form draft so switching breakpoint containers cannot discard user input.
