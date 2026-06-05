export const ErrorTypes = {
  MATCHER_NOT_FOUND: 1,
  NAVIGATION_GUARD_REDIRECT: 2,
  NAVIGATION_ABORTED: 4,
  NAVIGATION_CANCELLED: 8,
  NAVIGATION_DUPLICATED: 16,
} as const;

export type ErrorTypes = typeof ErrorTypes[keyof typeof ErrorTypes];

export const NavigationFailureType = {
  aborted: ErrorTypes.NAVIGATION_ABORTED,
  cancelled: ErrorTypes.NAVIGATION_CANCELLED,
  duplicated: ErrorTypes.NAVIGATION_DUPLICATED,
} as const;

export type NavigationFailureType = typeof NavigationFailureType[keyof typeof NavigationFailureType];

export function isNavigationFailure(_error: any, _type?: number): boolean {
  return false;
}
