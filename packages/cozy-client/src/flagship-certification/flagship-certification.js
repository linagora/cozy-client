import CozyClient from '../CozyClient'
import { getAppAttestationFromStore } from './store-attestation'
/**
 * Request a challenge from the Stack that can be used to request the app attestation from the app store
 *
 * @param {CozyClient} client - the CozyClient instance
 * @returns {Promise<string>} - the Nonce string returned by the stack
 */
const getStackChallenge = async client => {
  try {
    const stackClient = client.getStackClient()

    const result = await stackClient.fetchJSON(
      'POST',
      `/auth/clients/${stackClient.oauthOptions.clientID}/challenge`,
      null,
      {
        headers: {
          Authorization: stackClient.registrationAccessTokenToAuthHeader()
        }
      }
    )

    return result.nonce
  } catch (e) {
    throw new Error(
      '[FLAGSHIP_CERTIFICATION] Something went wrong while requesting a challenge from CozyStack:\n' +
        e.message
    )
  }
}

/**
 * Give the app attestation to the Stack
 *
 * @param {import("./typedefs").AttestationResult} appAttestation - the app attestation that was returned by the app store
 * @param {string} nonce - the Nonce string retrieved from the stack
 * @param {CozyClient} client - the CozyClient instance
 */
const giveAppAttestationToStack = async (appAttestation, nonce, client) => {
  try {
    const { platform, attestation, keyId, issuer } = appAttestation

    const stackClient = client.getStackClient()

    await stackClient.fetchJSON(
      'POST',
      `/auth/clients/${stackClient.oauthOptions.clientID}/attestation`,
      {
        platform: platform,
        attestation: attestation,
        challenge: nonce,
        keyId: keyId,
        issuer: issuer
      },
      {
        headers: {
          Authorization: stackClient.registrationAccessTokenToAuthHeader()
        }
      }
    )
  } catch (e) {
    throw new Error(
      '[FLAGSHIP_CERTIFICATION] Something went wrong while giving attestation to CozyStack:\n' +
        e.message
    )
  }
}

/**
 * Verify app's identity and integrity so the Stack can trust it
 * Verification is done on Stack side by using information from the app's store (Google Play or Apple AppStore)
 *
 * @param {import("./typedefs").CertificationConfig} certificationConfig - the required configuration to access the stores API
 * @param {CozyClient} client - the CozyClient instance
 */
export const certifyFlagship = async (certificationConfig, client) => {
  if (!certificationConfig) {
    throw new Error(
      '[FLAGSHIP_CERTIFICATION] Certification configuration is not set'
    )
  }

  try {
    const stackChallengeNonce = await getStackChallenge(client)

    const appAttestation = await getAppAttestationFromStore(
      stackChallengeNonce,
      certificationConfig
    )

    await giveAppAttestationToStack(appAttestation, stackChallengeNonce, client)
  } catch (e) {
    console.warn(
      `[FLAGSHIP_CERTIFICATION] Automatic certification for URI "${client.stackClient.uri}" failed. This is expected on dev environments and non-official phones. Cozy-stack will continue with manual certification through 2FA`
    )
    console.warn(e.message)
  }
}
