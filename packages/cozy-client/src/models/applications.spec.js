import flag from 'cozy-flags'
import { applications } from './'
const {
  getAppDisplayName,
  getStoreURL,
  getStoreInstallationURL,
  sortApplicationsList,
  checkEntrypointCondition,
  shouldDisplayEntrypoint,
  selectEntrypoints,
  filterEntrypoints
} = applications

jest.mock('cozy-flags')

describe('applications model', () => {
  describe('application name', () => {
    it('should return names', () => {
      expect(getAppDisplayName({ name_prefix: 'Test', name: 'App' })).toBe(
        'Test App'
      )
      expect(getAppDisplayName({ name_prefix: '', name: 'App' })).toBe('App')
      expect(getAppDisplayName({ name: 'App' })).toBe('App')
      expect(getAppDisplayName({ name_prefix: '', name: 'My App' })).toBe(
        'My App'
      )
      expect(getAppDisplayName({ name_prefix: 'Cozy', name: 'Cloud' })).toBe(
        'Cloud'
      )
      expect(getAppDisplayName({ name_prefix: 'Cozy', name: 'Cozy' })).toBe(
        'Cozy'
      )
      expect(getAppDisplayName({ name_prefix: 'Twake', name: 'Cloud' })).toBe(
        'Cloud'
      )
      expect(getAppDisplayName({ name_prefix: 'Twake', name: 'Twake' })).toBe(
        'Twake'
      )
    })

    it('should support translations', () => {
      const lang = 'fr'
      expect(
        getAppDisplayName(
          {
            name_prefix: 'Test',
            name: 'One',
            locales: {
              fr: {
                name_prefix: 'Essai',
                name: 'Un'
              }
            }
          },
          lang
        )
      ).toBe('Essai Un')
      expect(
        getAppDisplayName(
          {
            name_prefix: 'Test',
            name: 'One',
            locales: {
              fr: {
                name: 'Un'
              }
            }
          },
          lang
        )
      ).toBe('Test Un')
      expect(
        getAppDisplayName(
          {
            name_prefix: 'Test',
            name: 'One',
            locales: {
              fr: {
                name_prefix: 'Essai'
              }
            }
          },
          lang
        )
      ).toBe('Essai One')
      expect(
        getAppDisplayName(
          {
            name_prefix: 'Test',
            name: 'One',
            locales: {
              de: {
                name_prefix: 'Versuch'
              }
            }
          },
          lang
        )
      ).toBe('Test One')
    })
  })

  describe('get store url', () => {
    const contactsApp = { slug: 'contacts' }

    describe('when the store app is not installed', () => {
      it('should return null', () => {
        expect(getStoreURL([], contactsApp)).toBe(null)
      })
    })

    describe('when the store app is installed', () => {
      it('should return the store url for the given app', () => {
        const storeApp = {
          slug: 'store',
          links: {
            related: 'http://store.cozy.tools:8080/'
          }
        }
        expect(getStoreURL([storeApp], contactsApp)).toBe(
          'http://store.cozy.tools:8080/#/discover/contacts'
        )
      })
    })
  })

  describe('getUrl', () => {
    const related = 'http://calendar.cozy.tools:8080/'

    const mockFlags = flags => flag.mockImplementation(name => flags[name])

    beforeEach(() => {
      flag.mockReset()
    })

    it('returns links.related when the app has no client_url_flag', () => {
      expect(applications.getUrl({ links: { related } })).toBe(related)
    })

    it('returns the flag value of a standalone app when it is a valid URL', () => {
      mockFlags({
        'apps.enable-standalone-apps': true,
        'calendar.embedded-app-url': 'https://calendar.example.com/'
      })
      const app = {
        standalone: true,
        client_url_flag: 'calendar.embedded-app-url',
        links: { related }
      }
      expect(applications.getUrl(app)).toBe('https://calendar.example.com/')
      expect(flag).toHaveBeenCalledWith('calendar.embedded-app-url')
    })

    it.each([null, true, 'not a url', 'javascript:alert(1)'])(
      'returns links.related when the flag value is %p',
      value => {
        mockFlags({
          'apps.enable-standalone-apps': true,
          'calendar.embedded-app-url': value
        })
        const app = {
          standalone: true,
          client_url_flag: 'calendar.embedded-app-url',
          links: { related }
        }
        expect(applications.getUrl(app)).toBe(related)
      }
    )

    it.each([undefined, false])(
      'returns links.related when standalone is %p',
      standalone => {
        mockFlags({
          'apps.enable-standalone-apps': true,
          'mail.embedded-app-url': 'https://mail.example.com/'
        })
        const app = {
          standalone,
          client_url_flag: 'mail.embedded-app-url',
          links: { related }
        }
        expect(applications.getUrl(app)).toBe(related)
      }
    )

    it('returns links.related while standalone apps are not enabled', () => {
      mockFlags({
        'calendar.embedded-app-url': 'https://calendar.example.com/'
      })
      const app = {
        standalone: true,
        client_url_flag: 'calendar.embedded-app-url',
        links: { related }
      }
      expect(applications.getUrl(app)).toBe(related)
    })
  })

  describe('get store installation url', () => {
    const contactsApp = { slug: 'contacts' }

    describe('when the store app is not installed', () => {
      it('should return null', () => {
        expect(getStoreInstallationURL([], contactsApp)).toBe(null)
      })
    })

    describe('when the store app is installed', () => {
      it('should return the store installation url for the given app', () => {
        const storeApp = {
          slug: 'store',
          links: {
            related: 'http://store.cozy.tools:8080/'
          }
        }
        expect(getStoreInstallationURL([storeApp], contactsApp)).toBe(
          'http://store.cozy.tools:8080/#/discover/contacts/install'
        )
      })
    })
  })

  describe('sort applications list', () => {
    it('should sort apps according to the given order', () => {
      const availableApps = [
        { slug: 'drive', name: 'Drive' },
        { slug: 'chat', name: 'Chat' },
        { slug: 'mail', name: 'Mail' },
        { slug: 'contacts', name: 'Contacts' },
        { slug: 'password', name: 'Password' }
      ]
      const order = ['chat', 'drive', 'mail', 'password', 'contacts']

      const expected = [
        { slug: 'chat', name: 'Chat' },
        { slug: 'drive', name: 'Drive' },
        { slug: 'mail', name: 'Mail' },
        { slug: 'password', name: 'Password' },
        { slug: 'contacts', name: 'Contacts' }
      ]

      const result = sortApplicationsList(availableApps, order)
      expect(result).toEqual(expected)
    })

    it('should handle apps not in the order array', () => {
      const availableApps = [
        { slug: 'drive', name: 'Drive' },
        { slug: 'chat', name: 'Chat' },
        { slug: 'store', name: 'Store' },
        { slug: 'mail', name: 'Mail' },
        { slug: 'contacts', name: 'Contacts' },
        { slug: 'password', name: 'Password' },
        { slug: 'calendar', name: 'Calendar' }
      ]
      const order = ['chat', 'drive', 'mail', 'password', 'contacts']

      const expected = [
        { slug: 'chat', name: 'Chat' },
        { slug: 'drive', name: 'Drive' },
        { slug: 'mail', name: 'Mail' },
        { slug: 'password', name: 'Password' },
        { slug: 'contacts', name: 'Contacts' },
        { slug: 'store', name: 'Store' },
        { slug: 'calendar', name: 'Calendar' }
      ]

      const result = sortApplicationsList(availableApps, order)
      expect(result).toEqual(expected)
    })

    it('should handle an empty apps array', () => {
      const availableApps = []
      const order = ['chat', 'drive', 'mail', 'password', 'notes', 'contacts']

      const expected = []

      const result = sortApplicationsList(availableApps, order)
      expect(result).toEqual(expected)
    })

    it('should handle an empty order array', () => {
      const availableApps = [
        { slug: 'drive', name: 'Drive' },
        { slug: 'chat', name: 'Chat' },
        { slug: 'store', name: 'Store' },
        { slug: 'mail', name: 'Mail' },
        { slug: 'contacts', name: 'Contacts' },
        { slug: 'password', name: 'Password' }
      ]
      const order = []

      const expected = [
        { slug: 'drive', name: 'Drive' },
        { slug: 'chat', name: 'Chat' },
        { slug: 'store', name: 'Store' },
        { slug: 'mail', name: 'Mail' },
        { slug: 'contacts', name: 'Contacts' },
        { slug: 'password', name: 'Password' }
      ]

      const result = sortApplicationsList(availableApps, order)
      expect(result).toEqual(expected)
    })
  })

  describe('entrypoints', () => {
    beforeEach(() => {
      flag.mockReset()
    })

    describe('checkEntrypointCondition', () => {
      it('should return true when flag condition is met', () => {
        flag.mockReturnValue(true)
        /** @type {import('./applications').EntrypointCondition} */
        const condition = {
          type: 'flag',
          name: 'drive.office.enabled',
          value: true
        }
        expect(checkEntrypointCondition(condition)).toBe(true)
      })

      it('should return false when flag condition is not met', () => {
        flag.mockReturnValue(false)
        /** @type {import('./applications').EntrypointCondition} */
        const condition = {
          type: 'flag',
          name: 'drive.office.enabled',
          value: true
        }
        expect(checkEntrypointCondition(condition)).toBe(false)
      })

      it('should return false for unknown condition types', () => {
        const condition = {
          type: 'unknown',
          name: 'some.flag',
          value: true
        }
        // @ts-expect-error Testing a bad format on purpose
        expect(checkEntrypointCondition(condition)).toBe(false)
      })
    })

    describe('shouldDisplayEntrypoint', () => {
      it('should return true when entrypoint has no conditions', () => {
        /** @type {import('./applications').Entrypoint} */
        const entrypoint = {
          name: 'test-entrypoint',
          title: { en: 'Test' },
          hash: '/test',
          icon: 'test-icon'
        }
        expect(shouldDisplayEntrypoint(entrypoint)).toBe(true)
      })

      it('should return true when all conditions are met', () => {
        flag.mockReturnValue(true)
        /** @type {import('./applications').Entrypoint} */
        const entrypoint = {
          name: 'test-entrypoint',
          title: { en: 'Test' },
          hash: '/test',
          icon: 'test-icon',
          conditions: [
            { type: 'flag', name: 'drive.office.enabled', value: true }
          ]
        }
        expect(shouldDisplayEntrypoint(entrypoint)).toBe(true)
      })

      it('should return false when at least one condition is not met', () => {
        flag.mockImplementation((/** @type {string} */ name) => {
          if (name === 'drive.office.enabled') return true
          if (name === 'other.flag') return false
          return false
        })
        /** @type {import('./applications').Entrypoint} */
        const entrypoint = {
          name: 'test-entrypoint',
          title: { en: 'Test' },
          hash: '/test',
          icon: 'test-icon',
          conditions: [
            { type: 'flag', name: 'drive.office.enabled', value: true },
            { type: 'flag', name: 'other.flag', value: true }
          ]
        }
        expect(shouldDisplayEntrypoint(entrypoint)).toBe(false)
      })

      it('should return true when conditions array is empty', () => {
        /** @type {import('./applications').Entrypoint} */
        const entrypoint = {
          name: 'test-entrypoint',
          title: { en: 'Test' },
          hash: '/test',
          icon: 'test-icon',
          conditions: []
        }
        expect(shouldDisplayEntrypoint(entrypoint)).toBe(true)
      })
    })

    describe('selectEntrypoints', () => {
      const entrypoints = [
        {
          name: 'new-file-type-text',
          title: { en: 'Doc' },
          hash: '/onlyoffice/create/text',
          icon: 'icon-text'
        },
        {
          name: 'new-file-type-spreadsheet',
          title: { en: 'Spreadsheet' },
          hash: '/onlyoffice/create/spreadsheet',
          icon: 'icon-spreadsheet'
        },
        {
          name: 'new-file-type-presentation',
          title: { en: 'Presentation' },
          hash: '/onlyoffice/create/presentation',
          icon: 'icon-presentation'
        }
      ]

      it('should return entrypoints matching the given names', () => {
        const names = ['new-file-type-text', 'new-file-type-presentation']
        const result = selectEntrypoints(entrypoints, names)
        expect(result).toHaveLength(2)
        expect(result[0].name).toBe('new-file-type-text')
        expect(result[1].name).toBe('new-file-type-presentation')
      })

      it('should return empty array when no names match', () => {
        const names = ['non-existent']
        const result = selectEntrypoints(entrypoints, names)
        expect(result).toEqual([])
      })

      it('should return all entrypoints when all names are provided', () => {
        const names = [
          'new-file-type-text',
          'new-file-type-spreadsheet',
          'new-file-type-presentation'
        ]
        const result = selectEntrypoints(entrypoints, names)
        expect(result).toHaveLength(3)
      })

      it('should return empty array when names array is empty', () => {
        const result = selectEntrypoints(entrypoints, [])
        expect(result).toEqual([])
      })
    })

    describe('filterEntrypoints', () => {
      it('should return only entrypoints that should be displayed', () => {
        flag.mockImplementation((/** @type {string} */ name) => {
          if (name === 'feature.1') return true
          if (name === 'feature.2') return false
          return false
        })

        /** @type {import('./applications').Entrypoint[]} */
        const entrypoints = [
          {
            name: 'always-visible',
            title: { en: 'Always' },
            hash: '/always',
            icon: 'icon'
          },
          {
            name: 'feature-1',
            title: { en: 'Feature 1' },
            hash: '/feature1',
            icon: 'icon',
            conditions: [{ type: 'flag', name: 'feature.1', value: true }]
          },
          {
            name: 'feature-2',
            title: { en: 'Feature 2' },
            hash: '/feature2',
            icon: 'icon',
            conditions: [{ type: 'flag', name: 'feature.2', value: true }]
          }
        ]

        const result = filterEntrypoints(entrypoints)
        expect(result).toHaveLength(2)
        expect(result[0].name).toBe('always-visible')
        expect(result[1].name).toBe('feature-1')
      })

      it('should return all entrypoints when all conditions are met', () => {
        flag.mockReturnValue(true)
        /** @type {import('./applications').Entrypoint[]} */
        const entrypoints = [
          {
            name: 'feature-1',
            title: { en: 'Feature 1' },
            hash: '/feature1',
            icon: 'icon',
            conditions: [{ type: 'flag', name: 'feature.1', value: true }]
          },
          {
            name: 'feature-2',
            title: { en: 'Feature 2' },
            hash: '/feature2',
            icon: 'icon',
            conditions: [{ type: 'flag', name: 'feature.2', value: true }]
          }
        ]

        const result = filterEntrypoints(entrypoints)
        expect(result).toHaveLength(2)
      })

      it('should return empty array when no entrypoints should be displayed', () => {
        flag.mockReturnValue(false)
        /** @type {import('./applications').Entrypoint[]} */
        const entrypoints = [
          {
            name: 'feature-1',
            title: { en: 'Feature 1' },
            hash: '/feature1',
            icon: 'icon',
            conditions: [{ type: 'flag', name: 'feature.1', value: true }]
          }
        ]

        const result = filterEntrypoints(entrypoints)
        expect(result).toEqual([])
      })

      it('should handle empty entrypoints array', () => {
        const result = filterEntrypoints([])
        expect(result).toEqual([])
      })
    })
  })
})
