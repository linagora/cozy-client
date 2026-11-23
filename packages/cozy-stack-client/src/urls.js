import isNode from 'detect-node'

const SECURED_PROTOCOL = 'https:'

/**
 * Get a uniform formatted URL and SSL information according to a provided URL
 */
export function getCozyURL() {
  return isNode ? getNodeCozyURL() : getBrowserCozyURL()
}

export function isSecureProtocol(urlArg) {
  let url = urlArg
  if (url === undefined) url = getCozyURL()

  return url.protocol === SECURED_PROTOCOL
}

export function getBrowserCozyURL() {
  try {
    const root = document.querySelector('[role=application]')
    const data = root.dataset

    return new URL(`${window.location.protocol}//${data.cozyDomain}`)
  } catch (e) {
    throw new Error(
      `[cozy-url] cozyDomain isn't defined in index.ejs https://git.io/fhmP9, (${e.message})`
    )
  }
}

export function getNodeCozyURL() {
  const { URL } = require('url')
  try {
    return new URL(process.env.COZY_URL)
  } catch (e) {
    throw new Error(
      `[cozy-url] COZY_URL variable isn't defined, (${e.message}).`
    )
  }
}
