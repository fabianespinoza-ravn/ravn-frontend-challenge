import { afterEach, describe, expect, it } from 'vitest'
import { getMobilePlatform } from './getMobilePlatform'

const pixelUserAgent =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'
const iPhoneUserAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
const desktopUserAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

function stubNavigator(values: Record<string, unknown>) {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(navigator, key, { configurable: true, value })
  }
}

afterEach(() => {
  for (const key of ['userAgent', 'userAgentData', 'platform', 'maxTouchPoints']) {
    Reflect.deleteProperty(navigator, key)
  }
})

describe('getMobilePlatform', () => {
  it('trusts the client hint when the browser exposes one', () => {
    stubNavigator({ userAgent: desktopUserAgent, userAgentData: { platform: 'Android' } })

    expect(getMobilePlatform()).toEqual('android')
  })

  it('reads a reduced Android user agent, which is all Chrome still sends', () => {
    stubNavigator({ userAgent: pixelUserAgent })

    expect(getMobilePlatform()).toEqual('android')
  })

  /*
   * Overriding only the user agent string is what a device toolbar does on a
   * browser without Client Hints, and what a custom user agent does anywhere.
   */
  it('falls back to the user agent when the hint describes the host instead', () => {
    stubNavigator({ userAgent: pixelUserAgent, userAgentData: { platform: 'Windows' } })

    expect(getMobilePlatform()).toEqual('android')
  })

  it('detects iOS from its user agent', () => {
    stubNavigator({ userAgent: iPhoneUserAgent })

    expect(getMobilePlatform()).toEqual('ios')
  })

  it('detects an iPad that reports itself as a desktop Mac', () => {
    stubNavigator({ userAgent: desktopUserAgent, platform: 'MacIntel', maxTouchPoints: 5 })

    expect(getMobilePlatform()).toEqual('ios')
  })

  it('treats a desktop browser as neither', () => {
    stubNavigator({ userAgent: desktopUserAgent, platform: 'Win32', maxTouchPoints: 0 })

    expect(getMobilePlatform()).toEqual('other')
  })
})
