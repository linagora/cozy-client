import MockDate from 'mockdate'

import {
  setContractSyncStatusInAccount,
  getContractSyncStatusFromAccount,
  getMutedErrors,
  muteError,
  getAccountLogin,
  getAccountName,
  buildAccount,
  isAccountWithTrigger
} from './account'

const fixtures = {
  simpleAccount: {
    _id: 'simple-account-id',
    account_type: 'test',
    auth: {
      login: 'login',
      password: 'pass'
    }
  },
  existingAccount: {
    _id: '561be660ff384ce0846c8f20e829ad62',
    account_type: 'test',
    auth: {
      login: 'login',
      password: 'pass'
    },
    relationships: {
      contracts: {
        data: [{ _id: 'contract-id-1', _type: 'io.cozy.bank.accounts' }]
      }
    }
  }
}

describe('account model', () => {
  const MOCKED_DATE = '2018-05-05T09:09:00.115Z'

  beforeAll(() => {
    MockDate.set(MOCKED_DATE)
  })

  afterAll(() => {
    jest.restoreAllMocks()
    MockDate.reset()
  })

  it('should return the listy of muted errors', () => {
    const accountWithMutedErrors = {
      account_type: 'example-konnector',
      auth: {
        identifier: '0000000000'
      },
      mutedErrors: [
        {
          type: 'LOGIN_FAILED',
          mutedAt: '2019-12-01T00:48:01.404911778Z'
        },
        {
          type: 'LOGIN_FAILED',
          mutedAt: '2019-14-01T00:48:01.404911778Z'
        }
      ]
    }
    expect(getMutedErrors(accountWithMutedErrors)).toEqual([
      {
        type: 'LOGIN_FAILED',
        mutedAt: '2019-12-01T00:48:01.404911778Z'
      },
      {
        type: 'LOGIN_FAILED',
        mutedAt: '2019-14-01T00:48:01.404911778Z'
      }
    ])

    const accountWithoutMutedErrors = {
      account_type: 'example-konnector',
      auth: {
        identifier: '0000000000'
      }
    }
    expect(getMutedErrors(accountWithoutMutedErrors)).toEqual([])
  })

  it('should mute the first error', () => {
    const baseAccount = {
      account_type: 'example-konnector'
    }
    expect(muteError(baseAccount, 'LOGIN_FAILED')).toEqual({
      account_type: 'example-konnector',
      mutedErrors: [
        {
          type: 'LOGIN_FAILED',
          mutedAt: MOCKED_DATE
        }
      ]
    })
  })

  it('should mute subsequent error', () => {
    const account = {
      account_type: 'example-konnector',
      mutedErrors: [
        {
          type: 'LOGIN_FAILED',
          mutedAt: '2018-04-05T09:09:00.115Z'
        },
        {
          type: 'USER_ACTION_NEEDED',
          mutedAt: '2018-04-15T09:09:00.115Z'
        }
      ]
    }
    expect(muteError(account, 'LOGIN_FAILED')).toEqual({
      account_type: 'example-konnector',
      mutedErrors: [
        {
          type: 'LOGIN_FAILED',
          mutedAt: '2018-04-05T09:09:00.115Z'
        },
        {
          type: 'USER_ACTION_NEEDED',
          mutedAt: '2018-04-15T09:09:00.115Z'
        },
        {
          type: 'LOGIN_FAILED',
          mutedAt: MOCKED_DATE
        }
      ]
    })
  })

  describe('contract sync status', () => {
    it('should get/set correctly the sync status', () => {
      const CONTRACT_ID = 'contract-id-1'

      const syncStatus = getContractSyncStatusFromAccount(
        fixtures.existingAccount,
        CONTRACT_ID
      )
      // Check that default value is correctly returned
      expect(syncStatus).toBe(true)

      const account2 = setContractSyncStatusInAccount(
        fixtures.existingAccount,
        CONTRACT_ID,
        false
      )
      const syncStatus2 = getContractSyncStatusFromAccount(
        account2,
        CONTRACT_ID
      )
      expect(syncStatus2).toBe(false)
      const account3 = setContractSyncStatusInAccount(
        account2,
        CONTRACT_ID,
        true
      )
      const syncStatus3 = getContractSyncStatusFromAccount(
        account3,
        CONTRACT_ID
      )

      expect(syncStatus3).toBe(true)
    })

    it('should throw when getting/setting sync status for contract that does not exist', () => {
      expect(() =>
        getContractSyncStatusFromAccount(
          fixtures.existingAccount,
          'non-existing-contract-id'
        )
      ).toThrow('Cannot find contrat non-existing-contract-id in account')
      expect(() =>
        setContractSyncStatusInAccount(
          fixtures.existingAccount,
          'non-existing-contract-id'
        )
      ).toThrow('Cannot find contrat non-existing-contract-id in account')
    })
  })

  describe('getAccountLogin', () => {
    it('should get the login value according to legacyLoginFields order', () => {
      expect(
        getAccountLogin({
          auth: { test: 'testvalue', login: 'loginvalue', email: 'emailvalue' }
        })
      ).toStrictEqual('loginvalue')

      expect(
        getAccountLogin({
          auth: { test: 'testvalue', email: 'emailvalue' }
        })
      ).toStrictEqual('emailvalue')

      expect(
        getAccountLogin({
          auth: { test: 'testvalue', email: 'emailvalue', login: 'loginvalue' }
        })
      ).toStrictEqual('loginvalue')

      expect(
        getAccountLogin({
          auth: { test: 'testvalue' }
        })
      ).toStrictEqual(null)
    })
  })

  describe('getAccountLogin', () => {
    it('should return account.identifier field if defined', () => {
      expect(
        getAccountLogin({
          _id: 'accountid',
          auth: {
            login: 'loginfield',
            other: 'identifierfield'
          },
          identifier: 'other'
        })
      ).toStrictEqual('identifierfield')
    })

    it('should return login field if no identifier is defined', () => {
      expect(
        getAccountLogin({
          _id: 'accountid',
          auth: {
            login: 'loginfield',
            other: 'identifierfield'
          }
        })
      ).toStrictEqual('loginfield')
    })
  })

  describe('getAccountName', () => {
    it('should return auth.accountName in priority', () => {
      expect(
        getAccountName({
          _id: 'idvalue',
          auth: { _id: 'idvalue', login: 'loginvalue' }
        })
      ).toStrictEqual('loginvalue')

      expect(
        getAccountName({
          _id: 'idvalue',
          auth: {
            accountName: 'accountNameValue',
            login: 'loginvalue'
          }
        })
      ).toStrictEqual('accountNameValue')
    })
    it('should return account _id by default', () => {
      expect(
        getAccountName({
          _id: 'idvalue',
          auth: {}
        })
      ).toStrictEqual('idvalue')

      expect(
        getAccountName({
          _id: 'idvalue'
        })
      ).toStrictEqual('idvalue')
    })
  })
  describe('buildAccount', () => {
    it('should build an account', () => {
      expect(
        buildAccount(
          { slug: 'slugvalue', fields: { loginfield: { role: 'identifier' } } },
          { loginfield: 'loginfieldvalue' }
        )
      ).toStrictEqual({
        auth: { loginfield: 'loginfieldvalue' },
        account_type: 'slugvalue',
        identifier: 'loginfield',
        state: null
      })
    })
  })
  describe('isAccountWithTrigger', () => {
    it('should return true if an account is connected or not', async () => {
      const client = {
        query: jest.fn()
      }
      client.query.mockResolvedValueOnce({ data: [{ _id: 'testaccountid' }] })
      expect(
        await isAccountWithTrigger(client, { _id: 'testaccountid' })
      ).toStrictEqual(true)

      client.query.mockResolvedValueOnce({ data: [] })
      expect(
        await isAccountWithTrigger(client, { _id: 'testaccountid' })
      ).toStrictEqual(false)
    })
  })
})
