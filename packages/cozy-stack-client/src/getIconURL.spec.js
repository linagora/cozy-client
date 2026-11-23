import { getIconURL } from './getIconURL'
import logger from './logger'
import { ErrorReturned } from './memoize'

const FakeBlob = (data, options) => {
  return { data, ...options }
}

const resetCreateObjectURL = () => {
  global.URL.createObjectURL = jest.fn(blob => {
    return blob
  })
}
let responses

const fakeResp = (method, url) => {
  const resp = responses[url]
  return resp
    ? Promise.resolve(resp)
    : Promise.reject(`404: ${url} (not found in fake server)`)
}
describe('get icon', () => {
  let stackClient = {}

  beforeEach(() => {
    responses = {}

    stackClient.fetch = jest.fn().mockImplementation(fakeResp)
    stackClient.fetchJSON = jest.fn().mockImplementation(fakeResp)
    global.URL.createObjectURL = jest.fn(blob => {
      return blob
    })
  })

  afterEach(() => {
    global.URL.createObjectURL = undefined
  })

  const svgData = '<svg></svg>'
  const defaultOpts = {
    type: 'konnector',
    slug: 'caissedepargne1'
  }

  describe('when consuming app is using oauth', () => {
    beforeEach(() => {
      stackClient.oauthOptions = {}
    })

    it('should build a url when app is installed', async () => {
      responses['/konnectors/caissedepargne1/icon'] = {
        ok: true,
        blob: () => FakeBlob([svgData], { type: 'image/svg+xml' })
      }
      const url = await getIconURL(stackClient, defaultOpts)
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'image/svg+xml'
        })
      )
      expect(url.data[0]).toBe('<svg></svg>')
    })

    it('should build a url when app is not installed', async () => {
      responses['/registry/caissedepargne1/icon'] = {
        ok: true,
        blob: () => FakeBlob([svgData], { type: 'image/svg+xml' })
      }
      const url = await getIconURL(stackClient, defaultOpts)
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'image/svg+xml'
        })
      )
      expect(url.data[0]).toBe('<svg></svg>')
    })

    it('should build a url when app is installed but no mime type is sent in response', async () => {
      responses['/konnectors/caissedepargne1/icon'] = {
        ok: true,
        blob: () => new FakeBlob([svgData], {})
      }
      responses['/registry/caissedepargne1'] = {
        latest_version: { manifest: { icon: 'icon.svg' } }
      }
      await getIconURL(stackClient, defaultOpts)
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'image/svg+xml'
        })
      )
    })

    it('should build a url when app is not installed and no mime type is sent in response', async () => {
      responses['/konnectors/caissedepargne1/icon'] = {
        ok: true,
        blob: () => new FakeBlob([svgData], {})
      }
      responses['/registry/caissedepargne1'] = {
        latest_version: { manifest: { icon: 'icon.svg' } }
      }
      await getIconURL(stackClient, defaultOpts)
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'image/svg+xml'
        })
      )
    })

    it('should return nothing for unknown file type', async () => {
      responses['/konnectors/caissedepargne1/icon'] = {
        ok: true,
        blob: () => new FakeBlob([svgData], {})
      }
      responses['/registry/caissedepargne1'] = {
        data: { name: 'caissedepargne1', icon: 'icon.mp4' }
      }
      jest.spyOn(logger, 'warn').mockImplementation(() => {})
      const url = await getIconURL(stackClient, defaultOpts)
      logger.warn.mockRestore()
      expect(url).toEqual('')
    })

    it('should respect priority', async () => {
      responses['/konnectors/caissedepargne1/icon'] = {
        ok: true,
        blob: () => new FakeBlob([svgData], { type: 'image/svg+xml' })
      }
      responses['/registry/caissedepargne1/icon'] = {
        ok: true,
        blob: () =>
          new FakeBlob(['<svg id="2"></svg>'], { type: 'image/svg+xml' })
      }
      await getIconURL(stackClient, {
        ...defaultOpts,
        priority: 'registry'
      })
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          data: ['<svg id="2"></svg>']
        })
      )
    })

    it('should call the server the second time if the first time it failed', async () => {
      responses['/registry/caissedepargne1/icon'] = {
        ok: true,
        blob: () => FakeBlob([svgData], { type: 'image/svg+xml' })
      }
      stackClient.fetch = jest.fn().mockRejectedValue('No connexion')

      await getIconURL(stackClient, defaultOpts)
      expect(global.URL.createObjectURL).not.toHaveBeenCalled()

      stackClient.fetch = jest.fn().mockImplementation(fakeResp)
      const url2 = await getIconURL(stackClient, defaultOpts)
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'image/svg+xml'
        })
      )
      expect(url2.data[0]).toBe('<svg></svg>')
    })

    it('should not call create createObjectURL since it should be memoized', async () => {
      /**
       * Create a new response / request to be sure to not having memoized it already
       */
      responses['/konnectors/caissedepargne10/icon'] = {
        ok: true,
        blob: () => FakeBlob([svgData], { type: 'image/svg+xml' })
      }
      const url = await getIconURL(stackClient, {
        type: 'konnector',
        slug: 'caissedepargne10'
      })
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'image/svg+xml'
        })
      )
      expect(url.data[0]).toBe('<svg></svg>')
      resetCreateObjectURL()
      await getIconURL(stackClient, defaultOpts)

      expect(global.URL.createObjectURL).not.toHaveBeenCalled()
    })
  })

  describe('when consuming app is not using oauth', () => {
    beforeEach(() => {
      stackClient.oauthOptions = undefined
      stackClient.uri = 'http://cozy.tools:8080/anywhere/where/user/can/be'
    })

    it('should not create object url as blob', async () => {
      await getIconURL(stackClient, defaultOpts)
      expect(global.URL.createObjectURL).not.toHaveBeenCalled()
    })

    it('should return url from appData, links, icon if defined', async () => {
      defaultOpts.appData = { links: { icon: '/path/to/icon' } }
      const url = await getIconURL(stackClient, defaultOpts)
      expect(url).toEqual('http://cozy.tools:8080/path/to/icon')
    })

    it('should return url from registry if app data not containing icon path', async () => {
      defaultOpts.appData = { latest_version: { version: '3' }, slug: 'slug' }
      defaultOpts.slug = undefined
      const url = await getIconURL(stackClient, defaultOpts)
      expect(url).toEqual('http://cozy.tools:8080/registry/slug/3/icon')
    })

    it('should catch occurring error and returns nothing - ErrorReturned', async () => {
      stackClient.uri = undefined
      const url = await getIconURL(stackClient, defaultOpts)
      expect(url).toEqual(new ErrorReturned())
    })

    it('should catch occurring error and returns nothing - ErrorReturned', async () => {
      defaultOpts.appData = { latest_version: undefined, slug: 'slug' }
      defaultOpts.slug = undefined
      const url = await getIconURL(stackClient, defaultOpts)
      expect(url).toEqual(new ErrorReturned())
    })

    it('should return url from slug if appData is  undefined and there is a slug', async () => {
      defaultOpts.appData = undefined
      defaultOpts.slug = 'slug'
      const url = await getIconURL(stackClient, defaultOpts)
      expect(url).toEqual('http://cozy.tools:8080/registry/slug/icon')
    })

    it('should return url from slug if appData is  version latest_version but there is a slug', async () => {
      defaultOpts.appData = { latest_version: { version: '3' }, slug: 'slug' }
      defaultOpts.slug = 'slug'
      const url = await getIconURL(stackClient, defaultOpts)
      expect(url).toEqual('http://cozy.tools:8080/registry/slug/icon')
    })

    it('should return url from appData, links, icon if defined, even if slug defined', async () => {
      defaultOpts.appData = { links: { icon: '/path/to/icon' } }
      defaultOpts.slug = 'slug'
      const url = await getIconURL(stackClient, defaultOpts)
      expect(url).toEqual('http://cozy.tools:8080/path/to/icon')
    })
  })
})
