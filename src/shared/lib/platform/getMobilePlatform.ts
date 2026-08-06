export type MobilePlatform = 'android' | 'ios' | 'other'

type NavigatorUserAgentData = {
  platform?: string
}

/**
 * Client Hints are the signal Chromium keeps as it trims the user agent string,
 * and device emulation sets them alongside that string, so an emulated Pixel and
 * a physical one answer the same. Safari and Firefox do not expose them, which
 * is why a miss falls through to the user agent rather than deciding anything.
 */
function getHintedPlatform(): MobilePlatform | null {
  const { userAgentData } = navigator as Navigator & { userAgentData?: NavigatorUserAgentData }

  if (userAgentData?.platform === 'Android') {
    return 'android'
  }

  if (userAgentData?.platform === 'iOS') {
    return 'ios'
  }

  return null
}

export function getMobilePlatform(): MobilePlatform {
  if (typeof navigator === 'undefined') {
    return 'other'
  }

  const hintedPlatform = getHintedPlatform()

  if (hintedPlatform) {
    return hintedPlatform
  }

  const userAgent = navigator.userAgent
  // iPadOS reports itself as a desktop Mac, and only the touch points give it away.
  const isIPad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1

  if (/iPad|iPhone|iPod/i.test(userAgent) || isIPad) {
    return 'ios'
  }

  if (/Android/i.test(userAgent)) {
    return 'android'
  }

  return 'other'
}
