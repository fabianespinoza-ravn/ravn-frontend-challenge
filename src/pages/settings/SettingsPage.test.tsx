import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { MockedResponse } from '@apollo/client/testing'
import { GET_PROFILE } from '@/entities/user/api/userOperations'
import { mockProfile } from '@/test/mocks/graphql'
import { SettingsPage } from './SettingsPage'

function profileMock(profile = mockProfile): MockedResponse {
  return { request: { query: GET_PROFILE }, result: { data: { profile } } }
}

function renderSettings(mocks: MockedResponse[]) {
  return render(
    <MockedProvider mocks={mocks}>
      <SettingsPage />
    </MockedProvider>,
  )
}

describe('SettingsPage', () => {
  afterEach(cleanup)

  it('waits for the profile before showing anything about it', () => {
    renderSettings([profileMock()])

    expect(screen.getByRole('status')).toHaveTextContent('Loading profile')
  })

  it('shows the authenticated name, email and position', async () => {
    renderSettings([profileMock()])

    expect(await screen.findByRole('heading', { name: mockProfile.fullName })).toBeInTheDocument()
    expect(screen.getByText(mockProfile.email)).toBeInTheDocument()
    expect(screen.getByText('Position')).toBeInTheDocument()
  })

  /*
   * `mockProfile` was created on 2026-08-04T00:00:00.000Z. Read locally, every
   * timezone west of UTC would call that August 3rd and a boundary date would
   * change month, so the value is read in UTC and this assertion holds wherever
   * the suite runs.
   */
  it('names the month the account was opened', async () => {
    renderSettings([profileMock()])

    expect(await screen.findByText('Member since')).toBeInTheDocument()
    expect(screen.getByText('August 2026')).toBeInTheDocument()
  })

  it('leaves out the joining month when the stored value is not a date', async () => {
    renderSettings([profileMock({ ...mockProfile, createdAt: 'not-a-date' })])

    expect(await screen.findByText('Position')).toBeInTheDocument()
    expect(screen.queryByText('Member since')).not.toBeInTheDocument()
  })

  /* The API answers an enum; the page owes the reader a word. */
  it('spells each user type the way the challenge asks for it', async () => {
    renderSettings([profileMock()])

    expect(await screen.findByText('Candidate')).toBeInTheDocument()
    expect(screen.queryByText('CANDIDATE')).not.toBeInTheDocument()

    cleanup()
    renderSettings([profileMock({ ...mockProfile, type: 'ADMIN' })])

    expect(await screen.findByText('Admin')).toBeInTheDocument()
  })

  /*
   * `mockProfile` carries a null avatar, which contract 5.2 confirmed the API
   * can return, so the fallback is what this profile actually renders.
   */
  it('falls back to initials when the profile has no avatar', async () => {
    renderSettings([profileMock()])

    const avatar = await screen.findByRole('img', {
      name: `${mockProfile.fullName}, profile picture`,
    })

    expect(avatar).toHaveTextContent('FE')
    expect(avatar.querySelector('img')).toBeNull()
  })

  it('reports a failed profile request and offers to try again', async () => {
    const user = userEvent.setup()

    renderSettings([
      { request: { query: GET_PROFILE }, error: new Error('Network request failed') },
      profileMock(),
    ])

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load your profile')

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByRole('heading', { name: mockProfile.fullName })).toBeInTheDocument()
  })
})
