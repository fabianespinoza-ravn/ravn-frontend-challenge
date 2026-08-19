# Responsive design

## Responsive model

The interface combines a width breakpoint with platform detection. It is one web application, not separate native applications.

`layoutBreakpoint` is `768px`:

- At `768px` and above, the desktop composition is used.
- Below `768px`, the narrow/mobile composition is used.

`useIsNarrowViewport` listens for resize events when React must swap component trees. CSS Modules use the same breakpoint for visual rules.

## Platform detection

`getMobilePlatform()` returns `android`, `ios` or `other`. It prefers User-Agent Client Hints, then user-agent detection, and handles iPadOS as a touch-capable `MacIntel` device.

Platform detection affects interaction conventions; it does not change routes or data contracts.

| Context           | Navigation and create action                       | Task form              | Due-date picker                                     |
| ----------------- | -------------------------------------------------- | ---------------------- | --------------------------------------------------- |
| Desktop           | Persistent sidebar and toolbar create action.      | Modal.                 | Calendar with immediate selection.                  |
| Android, narrow   | Drawer, compact header and floating create button. | Full-page composition. | Material-style picker; selection commits on **OK**. |
| iOS/other, narrow | Bottom navigation and Add Project entry point.     | Full-page composition. | Three-wheel picker; values commit as chosen.        |

## Shared draft across layouts

The task-form draft belongs to `useTaskFormWorkflow`, which the layout calls, rather than to the modal or the full-page form. That hook also decides which of the two containers renders it. When viewport width crosses `768px`, the container can change while entered values, validation state and edit/create mode remain intact.

## Deadline feedback

The mapper computes a due-date tone using local calendar days:

- `future`: more than one day away; green.
- `soon`: today or tomorrow; yellow.
- `past`: before today; red.

The list applies the tones as visual borders and board cards highlight overdue dates. Counts, board/list switching and deadline feedback are documented as completed bonus features in the project README.
