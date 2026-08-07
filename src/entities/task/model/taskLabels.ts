import type { PointEstimate, TaskTag } from './apiTask'

export const pointEstimateValues: Record<PointEstimate, number> = {
  EIGHT: 8,
  FOUR: 4,
  ONE: 1,
  TWO: 2,
  ZERO: 0,
}

export const tagLabels: Record<TaskTag, string> = {
  ANDROID: 'Android',
  IOS: 'iOS App',
  NODE_JS: 'Node.js',
  RAILS: 'Rails',
  REACT: 'React',
}

export function getPointEstimateLabel(pointEstimate: PointEstimate) {
  const points = pointEstimateValues[pointEstimate]

  return `${points} ${points === 1 ? 'Point' : 'Points'}`
}
