import { hasExtensionInstalledAttribute } from './bitwarden'
import { hasPasswordDefinedAttribute } from './instance'
import { hasPassword } from './user'

jest.mock('./instance', () => ({
  hasPasswordDefinedAttribute: jest.fn(() => false)
}))

jest.mock('./bitwarden', () => ({
  hasExtensionInstalledAttribute: jest.fn(() => false)
}))

const setup = ({
  isOIDC = false,
  isMagicLink = false,
  passwordDefined = false,
  extensionInstalled = false
} = {}) => {
  hasPasswordDefinedAttribute.mockReturnValue(passwordDefined)
  hasExtensionInstalledAttribute.mockReturnValue(extensionInstalled)

  return {
    client: {
      capabilities: {
        can_auth_with_oidc: isOIDC,
        can_auth_with_magic_links: isMagicLink
      }
    }
  }
}

describe('hasPassword', () => {
  it('return true by default', async () => {
    const { client } = setup()
    expect(await hasPassword(client)).toBe(true)
  })
  it('return true when password defined', async () => {
    const { client } = setup({ passwordDefined: true })
    expect(await hasPassword(client)).toBe(true)
  })
  it('return true when extension installed', async () => {
    const { client } = setup({ extensionInstalled: true })
    expect(await hasPassword(client)).toBe(true)
  })
  it('return false when magic link without password', async () => {
    const { client } = setup({ isMagicLink: true })
    expect(await hasPassword(client)).toBe(false)
  })
  it('return true when magic link with password', async () => {
    const { client } = setup({ isMagicLink: true, passwordDefined: true })
    expect(await hasPassword(client)).toBe(true)
  })
  it('return false when OIDC without password', async () => {
    const { client } = setup({ isOIDC: true })
    expect(await hasPassword(client)).toBe(false)
  })
  it('return true when OIDC with password', async () => {
    const { client } = setup({ isOIDC: true, passwordDefined: true })
    expect(await hasPassword(client)).toBe(true)
  })
})
