import logger from '../logger'

let hasWarnedForceStack = false

// eslint-disable-next-line no-underscore-dangle
export const _resetForceStackWarning = () => {
  hasWarnedForceStack = false
}

/* eslint-disable jsdoc/check-tag-names */
/**
 * Resolves the effective forceLink target, mapping the deprecated forceStack option onto forceLink:'stack'.
 *
 * @internal
 * @param {{ forceLink?: string, forceStack?: boolean }} [options] - Query options
 * @returns {string|undefined}
 */
export const resolveForceLink = options => {
  if (options?.forceLink) return options.forceLink
  if (options?.forceStack) {
    if (!hasWarnedForceStack) {
      logger.warn(
        "options.forceStack is deprecated, use forceLink: 'stack' instead"
      )
      hasWarnedForceStack = true
    }
    return 'stack'
  }
  return undefined
}
/* eslint-enable jsdoc/check-tag-names */
