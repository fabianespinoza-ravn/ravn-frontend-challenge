export type MobilePlatform = 'android' | 'ios' | 'other'

export function getMobilePlatform(): MobilePlatform {
  if (typeof navigator === 'undefined') {
    return 'other'
  }

  const userAgent = navigator.userAgent
  const isIPad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1

  if (/iPad|iPhone|iPod/i.test(userAgent) || isIPad) {
    return 'ios'
  }

  if (/Android/i.test(userAgent)) {
    return 'android'
  }

  return 'other'
}
