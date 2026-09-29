export {
  deconstructCozyWebLinkWithSlug,
  deconstructRedirectLink,
  generateWebLink,
  ensureFirstSlash,
  isHttpUrl,
  fetchRegistrationDetails,
  rootCozyUrl,
  InvalidRedirectLinkError,
  InvalidCozyUrlError,
  InvalidProtocolError,
  BlockedCozyError
} from './urlHelper'

export { dehydrate } from './dehydrateHelper'

export {
  editSettings,
  getQuery,
  getSettings,
  normalizeSettings,
  saveAfterFetchSettings
} from './settings'
