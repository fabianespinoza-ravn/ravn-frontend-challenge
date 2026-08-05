import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppLayout } from './AppLayout'
import { createGraphqlMocks } from '@/test/mocks/graphql'

const platformMock = vi.hoisted(() => ({ value: 'android' }))

vi.mock('@/shared/lib/platform/getMobilePlatform', () => ({
  getMobilePlatform: () => platformMock.value,
}))

afterEach(() => {
  cleanup()
  platformMock.value = 'android'
})

describe('AppLayout', () => {
  it('opens Add Project from the Android floating action button', () => {
    render(
      <MockedProvider mocks={createGraphqlMocks()}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<h1>Dashboard</h1>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </MockedProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add Project' }))

    expect(screen.getByRole('heading', { name: 'Task Title' })).toBeInTheDocument()
  })

  it('opens Add Project from the iOS-style bottom navigation', () => {
    platformMock.value = 'other'

    render(
      <MockedProvider mocks={createGraphqlMocks()}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<h1>Dashboard</h1>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </MockedProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add Project' }))

    expect(screen.getByRole('heading', { name: 'Task Title' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'Dashboard' }))

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Task Title' })).not.toBeInTheDocument()
  })

  it('closes Add Project and restores the current route when the viewport reaches desktop width', () => {
    platformMock.value = 'other'
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })

    render(
      <MockedProvider mocks={createGraphqlMocks()}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<h1>Dashboard</h1>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </MockedProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add Project' }))

    expect(screen.getByRole('heading', { name: 'Task Title' })).toBeInTheDocument()

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 768 })
    fireEvent(window, new Event('resize'))

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Task Title' })).not.toBeInTheDocument()
  })
})
