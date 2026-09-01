const {
  default: StackClient,
  OAuthClient: OriginalOAuthClient,
  normalizeDoc,
  FetchError
} = jest.requireActual('cozy-stack-client')

/**
 * @param {string} fileId - The target file or folder id
 * @param {object} [options] - Query options
 * @param {string|null} [options.driveId] - The shared drive id
 * @returns {Promise<{data: object[], meta: {file_id: string}}>} The mocked response
 */
function fetchEffectiveRecipients(fileId, options = {}) {
  void options
  return Promise.resolve({
    data: [],
    meta: { file_id: fileId }
  })
}

const collectionMock = {
  all: jest.fn(() => Promise.resolve()),
  // needed because we call it inside the CozyClient constructor
  // so we can't define it during the test
  get: jest.fn(() => Promise.resolve({ data: [] })),
  find: jest.fn(() => Promise.resolve()),
  create: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
  updateAll: jest.fn(() => Promise.resolve()),
  destroy: jest.fn(() => Promise.resolve()),
  findReferencedBy: jest.fn(() => Promise.resolve()),
  fetchEffectiveRecipients: jest.fn(fetchEffectiveRecipients)
}

class MockedStackClient extends StackClient {
  constructor(opts) {
    super(opts)
    this.collection = jest.fn(() => collectionMock)
  }
}

export class OAuthClient extends OriginalOAuthClient {
  constructor(opts) {
    super(opts)
    this.collection = jest.fn(() => collectionMock)
  }
}

export default MockedStackClient
export { normalizeDoc, FetchError }
