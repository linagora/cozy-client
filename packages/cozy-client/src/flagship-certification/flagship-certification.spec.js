import { createMockClient } from '../mock'
import { certifyFlagship } from './flagship-certification'
import { getAppAttestationFromStore } from './store-attestation'

jest.mock('./store-attestation', () => ({
  getAppAttestationFromStore: jest.fn()
}))

jest.mock('../logger', () => ({
  warn: jest.fn()
}))

const getClientMock = () => {
  const client = createMockClient({
    clientOptions: {
      oauth: {}
    }
  })

  client.stackClient.uri = 'http://cozy.tools:8080'

  client.stackClient.oauthOptions = {
    clientID: 'SOME_CLIENT_ID',
    registrationAccessToken: 'SOME_REGISTRATION_ACCESS_TOKEN'
  }

  return client
}

const mockCorrectChallengeRequest = client => {
  client.stackClient.fetchJSON.mockResolvedValueOnce({
    nonce: 'SOME_NONCE'
  })
}

const mockCorrectStoreApiRequest = () => {
  getAppAttestationFromStore.mockResolvedValueOnce({
    platform: 'android',
    attestation: 'SOME_STORE_ATTESTATION',
    keyId: 'SOME_KEY_ID'
  })
}

const mockCorrectCertificationConfig = () => {
  return {
    cloudProjectNumber: 'SOME_CLOUD_PROJECT_NUMBER'
  }
}

const getFetchJsonPostParams = (url, body = null) => {
  return [
    'POST',
    url,
    body,
    {
      headers: {
        Authorization: 'Bearer SOME_REGISTRATION_ACCESS_TOKEN'
      }
    }
  ]
}

const consoleWarn = console.warn

describe('certifyFlagship', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    getAppAttestationFromStore.mockReset()
    console.warn = jest.fn()
  })

  afterAll(() => {
    console.warn = consoleWarn
  })

  it('should ask challenge to cozy-stack, call the store API and then send the result to the stack', async () => {
    const client = getClientMock()

    const certificationConfig = mockCorrectCertificationConfig()

    mockCorrectChallengeRequest(client)

    mockCorrectStoreApiRequest()

    await certifyFlagship(certificationConfig, client)

    expect(client.stackClient.fetchJSON).toHaveBeenCalledWith(
      ...getFetchJsonPostParams(`/auth/clients/SOME_CLIENT_ID/challenge`)
    )

    expect(getAppAttestationFromStore).toHaveBeenCalledWith('SOME_NONCE', {
      cloudProjectNumber: 'SOME_CLOUD_PROJECT_NUMBER'
    })

    expect(client.stackClient.fetchJSON).toHaveBeenCalledWith(
      ...getFetchJsonPostParams(`/auth/clients/SOME_CLIENT_ID/attestation`, {
        platform: 'android',
        attestation: 'SOME_STORE_ATTESTATION',
        challenge: 'SOME_NONCE',
        keyId: 'SOME_KEY_ID'
      })
    )
  })

  it('should throw if no certification config is provided', async () => {
    const client = getClientMock()

    const certificationConfig = undefined

    mockCorrectChallengeRequest(client)

    client.stackClient.fetchJSON.mockImplementationOnce(() => {
      throw Error('SOME_STACK_CERTIFICATION_ERROR')
    })

    mockCorrectStoreApiRequest()

    await expect(certifyFlagship(certificationConfig, client)).rejects.toEqual(
      new Error(
        '[FLAGSHIP_CERTIFICATION] Certification configuration is not set'
      )
    )

    expect(client.stackClient.fetchJSON).not.toHaveBeenCalled()
    expect(getAppAttestationFromStore).not.toHaveBeenCalled()
  })

  it('should ask challenge to cozy-stack and then handle challenge query failure', async () => {
    const client = getClientMock()

    const certificationConfig = mockCorrectCertificationConfig()

    // Mock errored stack challenge request
    client.stackClient.fetchJSON.mockImplementation(() => {
      throw Error('SOME_STACK_CHALLENGE_ERROR')
    })

    mockCorrectStoreApiRequest()

    await certifyFlagship(certificationConfig, client)

    expect(client.stackClient.fetchJSON).toHaveBeenCalledWith(
      ...getFetchJsonPostParams(`/auth/clients/SOME_CLIENT_ID/challenge`)
    )

    expect(console.warn).toHaveBeenCalledWith(
      '[FLAGSHIP_CERTIFICATION] Automatic certification for URI "http://cozy.tools:8080" failed. This is expected on dev environments and non-official phones. Cozy-stack will continue with manual certification through 2FA'
    )
    expect(console.warn).toHaveBeenCalledWith(
      '[FLAGSHIP_CERTIFICATION] Something went wrong while requesting a challenge from CozyStack:\nSOME_STACK_CHALLENGE_ERROR'
    )
  })

  it('should ask challenge to cozy-stack, call the store API and then handle store API failure', async () => {
    const client = getClientMock()

    const certificationConfig = mockCorrectCertificationConfig()

    mockCorrectChallengeRequest(client)

    // Mock errored store API
    getAppAttestationFromStore.mockImplementationOnce(() => {
      throw Error('SOME_STORE_API_ERROR')
    })

    await certifyFlagship(certificationConfig, client)

    expect(client.stackClient.fetchJSON).toHaveBeenCalledWith(
      ...getFetchJsonPostParams(`/auth/clients/SOME_CLIENT_ID/challenge`)
    )

    expect(getAppAttestationFromStore).toHaveBeenCalledWith('SOME_NONCE', {
      cloudProjectNumber: 'SOME_CLOUD_PROJECT_NUMBER'
    })

    expect(console.warn).toHaveBeenCalledWith(
      '[FLAGSHIP_CERTIFICATION] Automatic certification for URI "http://cozy.tools:8080" failed. This is expected on dev environments and non-official phones. Cozy-stack will continue with manual certification through 2FA'
    )
    expect(console.warn).toHaveBeenCalledWith('SOME_STORE_API_ERROR')
  })

  it('should ask challenge to cozy-stack, call the store API, send the result to the stack and then handle cozy-stack certification failure', async () => {
    const client = getClientMock()

    const certificationConfig = mockCorrectCertificationConfig()

    mockCorrectChallengeRequest(client)

    // Mock errored stack certification request
    client.stackClient.fetchJSON.mockImplementationOnce(() => {
      throw Error('SOME_STACK_CERTIFICATION_ERROR')
    })

    mockCorrectStoreApiRequest()

    await certifyFlagship(certificationConfig, client)

    expect(client.stackClient.fetchJSON).toHaveBeenCalledWith(
      ...getFetchJsonPostParams(`/auth/clients/SOME_CLIENT_ID/challenge`)
    )

    expect(getAppAttestationFromStore).toHaveBeenCalledWith('SOME_NONCE', {
      cloudProjectNumber: 'SOME_CLOUD_PROJECT_NUMBER'
    })

    expect(client.stackClient.fetchJSON).toHaveBeenCalledWith(
      ...getFetchJsonPostParams(`/auth/clients/SOME_CLIENT_ID/attestation`, {
        platform: 'android',
        attestation: 'SOME_STORE_ATTESTATION',
        challenge: 'SOME_NONCE',
        keyId: 'SOME_KEY_ID'
      })
    )

    expect(console.warn).toHaveBeenCalledWith(
      '[FLAGSHIP_CERTIFICATION] Automatic certification for URI "http://cozy.tools:8080" failed. This is expected on dev environments and non-official phones. Cozy-stack will continue with manual certification through 2FA'
    )
    expect(console.warn).toHaveBeenCalledWith(
      '[FLAGSHIP_CERTIFICATION] Something went wrong while giving attestation to CozyStack:\nSOME_STACK_CERTIFICATION_ERROR'
    )
  })
})
