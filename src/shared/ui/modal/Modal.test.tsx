import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

function renderModal(onClose = vi.fn()) {
  return {
    onClose,
    ...render(
      <Modal label="Example dialog" onClose={onClose}>
        <button type="button">First</button>
        <button type="button">Last</button>
      </Modal>,
    ),
  }
}

afterEach(cleanup)

describe('Modal', () => {
  it('exposes an accessible dialog and focuses its first control', () => {
    renderModal()

    const dialog = screen.getByRole('dialog')

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('Example dialog')
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus()
  })

  it('closes on Escape and on a backdrop click', async () => {
    const user = userEvent.setup()
    const { container, onClose } = renderModal()

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledOnce()

    const backdrop = container.querySelector('button[aria-hidden="true"]')

    expect(backdrop).not.toBeNull()

    await user.click(backdrop as HTMLElement)

    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('keeps Tab inside the dialog', async () => {
    const user = userEvent.setup()

    renderModal()

    await user.tab()

    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus()

    await user.tab()

    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus()

    await user.tab({ shift: true })

    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus()
  })

  it('returns focus to the control that opened it', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    function Harness({ isOpen }: { isOpen: boolean }) {
      return (
        <div>
          <button type="button">Opener</button>
          {isOpen ? (
            <Modal label="Example dialog" onClose={onClose}>
              <button type="button">First</button>
            </Modal>
          ) : null}
        </div>
      )
    }

    const { rerender } = render(<Harness isOpen={false} />)

    await user.click(screen.getByRole('button', { name: 'Opener' }))

    expect(screen.getByRole('button', { name: 'Opener' })).toHaveFocus()

    rerender(<Harness isOpen />)

    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus()

    rerender(<Harness isOpen={false} />)

    expect(screen.getByRole('button', { name: 'Opener' })).toHaveFocus()
  })
})
