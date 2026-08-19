import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LiveAnnouncement } from './LiveAnnouncement'

afterEach(cleanup)

describe('LiveAnnouncement', () => {
  /*
   * The region has to be on the page before it has anything to say: one that
   * arrives together with its first message is announced by almost nothing.
   */
  it('stands on the page with nothing to say', () => {
    render(<LiveAnnouncement message="" />)

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('carries the message it is given', () => {
    render(<LiveAnnouncement message="No tasks match your filters." />)

    expect(screen.getByRole('status')).toHaveTextContent('No tasks match your filters.')
  })
})
