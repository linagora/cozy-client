import { createAssistant, editAssistant } from './assistant'

describe('assistant provider account', () => {
  const assistantData = {
    name: 'My agent',
    prompt: 'Be helpful',
    model: 'gemini-3-pro',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/v1',
    providerId: 'google',
    providerName: 'Google'
  }

  describe('createAssistant', () => {
    const buildClient = () => ({
      save: jest
        .fn()
        .mockResolvedValue({ data: { _id: 'account-id', _type: 'whatever' } })
    })

    it('stores the model as configuration, not as a credential', async () => {
      const client = buildClient()

      await createAssistant(client, assistantData)

      const account = client.save.mock.calls[0][0]
      expect(account.data.model).toBe('gemini-3-pro')
      // A model in `auth` would be duplicated into `credentials_encrypted`.
      expect(account.auth.login).toBeUndefined()
    })

    it('keeps the model next to the other llm_override fields', async () => {
      const client = buildClient()

      await createAssistant(client, { ...assistantData, apiKey: 'sk-1234' })

      const account = client.save.mock.calls[0][0]
      expect(account.data).toEqual({
        model: 'gemini-3-pro',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/v1'
      })
      expect(account.auth.password).toBe('sk-1234')
    })

    it('labels the account after the provider', async () => {
      const client = buildClient()

      await createAssistant(client, assistantData)

      const account = client.save.mock.calls[0][0]
      expect(account.identifier).toBe('accountName')
      expect(account.auth.accountName).toBe('Google')
      // `name` is computed by the stack from `auth[identifier]` on creation
      expect(account.name).toBeUndefined()
    })

    it('falls back to the provider id when no display name is given', async () => {
      const client = buildClient()

      await createAssistant(client, {
        ...assistantData,
        providerName: undefined
      })

      const account = client.save.mock.calls[0][0]
      expect(account.auth.accountName).toBe('google')
    })
  })

  describe('editAssistant', () => {
    const buildClient = provider => ({
      query: jest.fn().mockResolvedValue({
        data: { _id: 'assistant-id', relationships: {} },
        included: [provider]
      }),
      save: jest.fn().mockResolvedValue({ data: { _id: 'account-id' } })
    })

    it('migrates an account that still holds the model in auth.login', async () => {
      const client = buildClient({
        _id: 'account-id',
        auth: {
          login: 'gemini-2.5-flash',
          credentials_encrypted: 'encrypted-blob'
        }
      })

      await editAssistant(client, 'assistant-id', assistantData)

      const account = client.save.mock.calls[0][0]
      expect(account.data.model).toBe('gemini-3-pro')
      expect(account.auth.login).toBeUndefined()
      // Left alone: the stack reads the API key from it, never the model.
      expect(account.auth.credentials_encrypted).toBe('encrypted-blob')
    })

    it('relabels an account created before the naming fix', async () => {
      const client = buildClient({
        _id: 'account-id',
        auth: { login: 'gemini-2.5-flash' }
      })

      await editAssistant(client, 'assistant-id', assistantData)

      const account = client.save.mock.calls[0][0]
      expect(account.identifier).toBe('accountName')
      expect(account.auth.accountName).toBe('Google')
    })

    // Pre-existing coupling, pinned because the builder now expresses it once.
    it('replaces the stored API key when a new one is given', async () => {
      const client = buildClient({
        _id: 'account-id',
        auth: { accountName: 'Google', password: 'sk-old' }
      })

      await editAssistant(client, 'assistant-id', {
        ...assistantData,
        apiKey: 'sk-new'
      })

      expect(client.save.mock.calls[0][0].auth.password).toBe('sk-new')
    })

    it('keeps the stored API key when only a baseUrl is given', async () => {
      const client = buildClient({
        _id: 'account-id',
        auth: { accountName: 'Google', password: 'sk-old' }
      })

      await editAssistant(client, 'assistant-id', {
        ...assistantData,
        apiKey: undefined
      })

      expect(client.save.mock.calls[0][0].auth.password).toBe('sk-old')
    })

    it('drops the stored API key when neither key nor baseUrl is given', async () => {
      const client = buildClient({
        _id: 'account-id',
        auth: { accountName: 'Google', password: 'sk-old' }
      })

      await editAssistant(client, 'assistant-id', {
        ...assistantData,
        apiKey: undefined,
        baseUrl: undefined
      })

      const account = client.save.mock.calls[0][0]
      expect(account.auth.password).toBeUndefined()
      expect(account.data.baseUrl).toBeUndefined()
    })

    it('preserves the fields it does not own', async () => {
      const client = buildClient({
        _id: 'account-id',
        _rev: '3-abc',
        name: 'Google',
        cozyMetadata: { createdAt: 'yesterday' },
        auth: { accountName: 'Google', credentials_encrypted: 'blob' }
      })

      await editAssistant(client, 'assistant-id', assistantData)

      const account = client.save.mock.calls[0][0]
      expect(account._rev).toBe('3-abc')
      expect(account.cozyMetadata).toEqual({ createdAt: 'yesterday' })
      expect(account.auth.credentials_encrypted).toBe('blob')
    })

    it('updates the model of an already migrated account', async () => {
      const client = buildClient({
        _id: 'account-id',
        identifier: 'accountName',
        auth: { accountName: 'Google' },
        data: { model: 'gemini-2.5-flash', baseUrl: 'https://example.org' }
      })

      await editAssistant(client, 'assistant-id', assistantData)

      const account = client.save.mock.calls[0][0]
      expect(account.data.model).toBe('gemini-3-pro')
      expect(account.data.baseUrl).toBe(assistantData.baseUrl)
    })
  })
})
