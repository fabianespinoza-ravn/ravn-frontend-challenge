import { MockedProvider } from '@apollo/client/testing/react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TaskFiltersTestProvider } from '@/test/taskFilters'
import dropdownStyles from '@/shared/ui/field-dropdown/FieldDropdown.module.css'
import { TaskFiltersPanel } from './TaskFiltersPanel'

const originalInnerWidth = window.innerWidth

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
}

function renderPanel() {
  return render(
    <MockedProvider mocks={[]}>
      <TaskFiltersTestProvider>
        <TaskFiltersPanel />
      </TaskFiltersTestProvider>
    </MockedProvider>,
  )
}

afterEach(() => {
  cleanup()
  setViewportWidth(originalInnerWidth)
})

/**
 * jsdom computes no layout, so no assertion here can measure the overflow that
 * caused this. What it can hold is the decision that removed it: which of the
 * two presentations each side of the breakpoint renders. On a narrow viewport,
 * the filters stay in the toolbar flow rather than covering the task board.
 */
describe('TaskFiltersPanel', () => {
  describe('below the layout breakpoint', () => {
    beforeEach(() => {
      setViewportWidth(390)
    })

    it('reveals an inline filters region rather than a dialog', async () => {
      const user = userEvent.setup()
      renderPanel()

      await user.click(screen.getByRole('button', { name: 'Filters' }))

      expect(screen.getByRole('group', { name: 'Task filters' })).toBeInTheDocument()
      expect(screen.queryByRole('dialog', { name: 'Task filters' })).not.toBeInTheDocument()
    })

    it('uses direct chips for the three fixed option sets', async () => {
      const user = userEvent.setup()
      renderPanel()

      await user.click(screen.getByRole('button', { name: 'Filters' }))

      for (const group of ['Status', 'Estimate', 'Label']) {
        expect(screen.getByRole('group', { name: group })).toBeInTheDocument()
      }
      expect(screen.getByRole('button', { name: 'Backlog' })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
      expect(screen.getByRole('button', { name: 'Due date' })).toHaveClass(
        dropdownStyles.rowTrigger,
      )
    })
  })

  describe('at the layout breakpoint and above', () => {
    beforeEach(() => {
      setViewportWidth(768)
    })

    it('keeps the anchored panel, which has room to open rightward there', async () => {
      const user = userEvent.setup()
      renderPanel()

      await user.click(screen.getByRole('button', { name: 'Filters' }))

      expect(screen.getByRole('group', { name: 'Task filters' })).toBeInTheDocument()
      expect(screen.queryByRole('dialog', { name: 'Task filters' })).not.toBeInTheDocument()
    })

    it('leaves the fields as the compact chips the desktop row is built from', async () => {
      const user = userEvent.setup()
      renderPanel()

      await user.click(screen.getByRole('button', { name: 'Filters' }))

      expect(screen.getByRole('button', { name: 'Status' })).not.toHaveClass(
        dropdownStyles.rowTrigger,
      )
    })
  })
})
