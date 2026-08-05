import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AddProjectPage } from './AddProjectPage'

describe('AddProjectPage', () => {
  it('renders the static iOS Add Project composition', () => {
    render(<AddProjectPage onClose={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Close Add Project' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Task Title' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Estimate' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Label' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Assignee' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Due Date' })).toBeInTheDocument()
  })
})
