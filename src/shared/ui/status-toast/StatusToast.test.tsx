import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { StatusToast } from './StatusToast'

afterEach(cleanup)

describe('StatusToast', () => {
  /*
   * A live region inserted together with its first message is announced by
   * almost nothing, so the empty region has to be on the page from the start.
   */
  it('stands on the page with nothing in it', () => {
    render(<StatusToast announcementKey={0} message={null} />)

    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('carries one message at a time rather than stacking them', () => {
    const { rerender } = render(
      <StatusToast announcementKey={1} message="Task created successfully." />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Task created successfully.')

    rerender(<StatusToast announcementKey={2} message="Task deleted successfully." />)

    const region = screen.getByRole('status')

    expect(region).toHaveTextContent('Task deleted successfully.')
    expect(region).not.toHaveTextContent('Task created successfully.')
    expect(region.childElementCount).toEqual(1)
  })

  /*
   * Same sentence, new announcement: the paragraph is replaced rather than left
   * in place, which is what a screen reader needs in order to read it again.
   */
  it('replaces the paragraph when the same message is announced again', () => {
    const message = 'Task deleted successfully.'
    const { rerender } = render(<StatusToast announcementKey={1} message={message} />)

    const firstParagraph = screen.getByText(message)

    rerender(<StatusToast announcementKey={2} message={message} />)

    expect(screen.getByText(message)).not.toBe(firstParagraph)
  })
})
