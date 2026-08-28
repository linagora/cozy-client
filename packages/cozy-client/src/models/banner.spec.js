import {
  BANNERS_DOCTYPE,
  dismiss,
  getActiveBanner,
  getActiveBanners
} from './banner'
import vectors from './__fixtures__/io.cozy.banners.json'

/** A client that answers a collection read with the given documents. */
const clientListing = docs => ({
  query: jest.fn().mockResolvedValue({ data: docs })
})

/**
 * The fixtures are the contract vectors published with the doctype in
 * cozy-doctypes. Every client implementing io.cozy.banners runs the same cases,
 * so the implementations are checked against one specification rather than
 * against each other.
 *
 * They run through getActiveBanners, the entry point a consumer calls, rather
 * than against the internals: what matters is what an application ends up
 * displaying.
 */
describe('io.cozy.banners contract vectors', () => {
  const now = new Date(vectors.now)

  it.each(vectors.cases.map(testCase => [testCase.name, testCase]))(
    '%s',
    async (name, testCase) => {
      const banners = await getActiveBanners(clientListing(testCase.input), {
        now
      })

      const rendered = banners.map(banner => ({
        bannerId: banner.bannerId,
        severity: banner.severity,
        surface: banner.surface,
        cta: Boolean(banner.cta),
        secondaryCta: Boolean(banner.secondaryCta)
      }))

      expect(rendered).toEqual(testCase.expected)
    }
  )
})

describe('getActiveBanners', () => {
  const stored = {
    _id: 'abc',
    bannerId: 'quota.almost-full',
    category: 'quota',
    severity: 'critical',
    surface: 'inline',
    text: 'hi',
    lang: 'en',
    cta: { label: 'Go', url: 'http://example.org' },
    dismissible: true,
    dismissedAt: null,
    priority: 10,
    startsAt: '2020-01-01T00:00:00Z',
    endsAt: null,
    cozyMetadata: { createdByApp: 'stack', doctypeVersion: '1' }
  }

  it('should return banners ready to render, with every fallback applied', async () => {
    const banners = await getActiveBanners(clientListing([stored]))

    expect(banners).toHaveLength(1)
    // a severity or surface this client does not know is rendered with the
    // fallback rather than dropped, so a new value needs no client release
    expect(banners[0].severity).toBe('warning')
    expect(banners[0].surface).toBe('banner')
  })

  it('should query the doctype, not a wrapper around it', async () => {
    const client = clientListing([])
    await getActiveBanners(client)
    const [definition] = client.query.mock.calls[0]
    expect(definition.doctype).toBe(BANNERS_DOCTYPE)
  })

  it('should cope with an empty or missing collection', async () => {
    for (const data of [[], null, undefined]) {
      await expect(getActiveBanners(clientListing(data))).resolves.toEqual([])
    }
  })

  it('should not hide a failed read behind an empty list', async () => {
    // client.query resolves undefined when the client carries an onError
    // callback, which would otherwise read as "no banners apply"
    const client = { query: jest.fn().mockResolvedValue(undefined) }
    await expect(getActiveBanners(client)).rejects.toThrow(BANNERS_DOCTYPE)
  })

  it('should drop a call to action that is not an absolute https URL', async () => {
    // the documents live in a database the applications can write, and a
    // client renders this straight into an href
    const urls = [
      'javascript' + ':alert(document.cookie)',
      'data:text/html,<script>alert(1)</script>',
      'http://example.org/plans',
      '/plans'
    ]

    for (const url of urls) {
      const [banner] = await getActiveBanners(
        clientListing([{ ...stored, cta: { label: 'Go', url } }])
      )
      expect(banner.cta).toBeUndefined()
    }

    const [kept] = await getActiveBanners(
      clientListing([
        { ...stored, cta: { label: 'Go', url: 'https://example.org/plans' } }
      ])
    )
    expect(kept.cta.url).toBe('https://example.org/plans')
  })

  it('should hide a banner whose window bound is not the timestamp the doctype writes', async () => {
    // Date.parse falls back to an engine specific parser for everything else,
    // so the same document would be visible in one browser and hidden in
    // another, and the contract vectors could no longer describe both
    const bounds = ['2020-01-01', 'Jan 1 2020', '2020/01/01', 0, ['2020-01-01']]

    for (const startsAt of bounds) {
      await expect(
        getActiveBanners(clientListing([{ ...stored, startsAt }]))
      ).resolves.toEqual([])
    }
  })

  it('should rank a banner carrying no priority below one that does', async () => {
    // b.priority - a.priority is NaN without this, and a NaN comparator makes
    // sort keep insertion order and never reach the bannerId tiebreak
    const ranked = { ...stored, _id: 'a', bannerId: 'a.ranked', priority: 50 }
    const unranked = { ...stored, _id: 'b', bannerId: 'b.unranked' }
    delete unranked.priority

    const banners = await getActiveBanners(clientListing([unranked, ranked]))

    expect(banners.map(banner => banner.bannerId)).toEqual([
      'a.ranked',
      'b.unranked'
    ])
  })
})

describe('getActiveBanner', () => {
  const base = {
    bannerId: 'low',
    severity: 'info',
    surface: 'banner',
    priority: 1,
    dismissedAt: null,
    startsAt: '2020-01-01T00:00:00Z',
    endsAt: null,
    cozyMetadata: { createdByApp: 'stack', doctypeVersion: '1' }
  }

  it('should return the highest priority banner', async () => {
    const low = { ...base, _id: 'a' }
    const high = { ...base, _id: 'b', bannerId: 'high', priority: 99 }

    const banner = await getActiveBanner(clientListing([low, high]))

    expect(banner.bannerId).toBe('high')
  })

  it('should return null when nothing applies', async () => {
    await expect(getActiveBanner(clientListing([]))).resolves.toBeNull()
  })
})

describe('dismiss', () => {
  const stored = {
    _id: 'abc',
    _rev: '1-aaa',
    bannerId: 'quota.almost-full',
    severity: 'critical',
    surface: 'inline',
    cta: { label: 'Go', url: 'javascript:alert(1)' },
    dismissedAt: null
  }
  const at = '2026-07-22T12:00:00Z'

  // dismiss issues two shapes of query: the collection, to find every version
  // of the bannerId, then each document by id.
  const clientReturning = (doc, saveImpl) => ({
    query: jest
      .fn()
      .mockImplementation(definition =>
        Promise.resolve(
          definition?.id ? { data: doc } : { data: doc ? [].concat(doc) : [] }
        )
      ),
    save: saveImpl ?? jest.fn().mockResolvedValue({ data: doc })
  })

  it('should record the timestamp on the stored document', async () => {
    const client = clientReturning(stored)

    await dismiss(client, stored, { dismissedAt: at })

    expect(client.save).toHaveBeenCalledWith({
      _type: BANNERS_DOCTYPE,
      ...stored,
      dismissedAt: at
    })
  })

  it('should write back what the stack stored, not what the caller renders', async () => {
    // A caller holds a resolved banner, whose severity, surface and cta have
    // had the client fallbacks applied. Persisting those would overwrite the
    // values the stack wrote, and nothing server side prevents it.
    const [resolved] = await getActiveBanners(
      clientListing([
        {
          ...stored,
          category: 'quota',
          text: 'hi',
          lang: 'en',
          dismissible: true,
          priority: 1,
          startsAt: '2020-01-01T00:00:00Z',
          endsAt: null,
          cozyMetadata: { createdByApp: 'stack', doctypeVersion: '1' }
        }
      ])
    )
    const client = clientReturning(stored)

    await dismiss(client, resolved, { dismissedAt: at })

    const persisted = client.save.mock.calls[0][0]
    expect(persisted.severity).toBe('critical')
    expect(persisted.surface).toBe('inline')
    expect(persisted.cta).toEqual(stored.cta)
  })

  it('should refuse a banner with no identifier', async () => {
    const client = clientReturning(stored)
    await expect(dismiss(client, { bannerId: 'x' })).rejects.toThrow('_id')
    expect(client.save).not.toHaveBeenCalled()
  })

  it('should stop when the banner was already deleted', async () => {
    for (const missing of [null, []]) {
      const client = clientReturning(missing)
      await expect(
        dismiss(client, stored, { dismissedAt: at })
      ).resolves.toEqual({
        data: null
      })
      expect(client.save).not.toHaveBeenCalled()
    }
  })

  it('should not rewrite a dismissal another client already recorded', async () => {
    const already = { ...stored, dismissedAt: '2026-07-20T08:00:00Z' }
    const client = clientReturning(already)

    await expect(dismiss(client, stored, { dismissedAt: at })).resolves.toEqual(
      {
        data: already
      }
    )
    expect(client.save).not.toHaveBeenCalled()
  })

  it('should read the document back and write again on a conflict', async () => {
    const conflict = Object.assign(new Error('Document update conflict'), {
      status: 409
    })
    const fresh = { ...stored, _rev: '2-bbb' }
    // The first read returns the revision that loses the race and the second
    // the one that wins, so the assertion fails unless the document really was
    // read again rather than the losing revision retried.
    const client = {
      query: jest
        .fn()
        // the read by id, then the re-read after the conflict
        .mockResolvedValueOnce({ data: stored })
        .mockResolvedValue({ data: fresh }),
      save: jest
        .fn()
        .mockRejectedValueOnce(conflict)
        .mockResolvedValue({})
    }

    await dismiss(client, stored, { dismissedAt: at })

    // the read by id, then the re-read after the conflict
    expect(client.query).toHaveBeenCalledTimes(2)
    expect(client.save).toHaveBeenLastCalledWith({
      ...fresh,
      _type: BANNERS_DOCTYPE,
      dismissedAt: at
    })
  })

  it('should give up rather than loop when the retry conflicts too', async () => {
    const conflict = Object.assign(new Error('Document update conflict'), {
      status: 409
    })
    const client = clientReturning(
      stored,
      jest.fn().mockRejectedValue(conflict)
    )

    await expect(dismiss(client, stored, { dismissedAt: at })).rejects.toThrow(
      'Document update conflict'
    )
    expect(client.save).toHaveBeenCalledTimes(2)
  })

  it('should classify a conflict the pouch link rewrapped without a status', async () => {
    // CozyPouchLink rebuilds the error and keeps only the message, so the
    // status branch cannot be the one that recognises it.
    const rewrapped = new Error(
      'Coud not apply mutation: Document update conflict'
    )
    const client = clientReturning(
      stored,
      jest
        .fn()
        .mockRejectedValueOnce(rewrapped)
        .mockResolvedValue({ data: stored })
    )

    await dismiss(client, stored, { dismissedAt: at })

    expect(client.save).toHaveBeenCalledTimes(2)
  })

  it('should read the document the pouch link resolves as an array', async () => {
    const client = clientReturning([stored])

    await dismiss(client, stored, { dismissedAt: at })

    expect(client.save).toHaveBeenCalledWith({
      ...stored,
      _type: BANNERS_DOCTYPE,
      dismissedAt: at
    })
  })

  it('should write to the banners doctype whatever _type the document carries', async () => {
    // Nothing server side stops an application from persisting a _type of its
    // own on a stack authored banner, and the spread order decides where the
    // write lands.
    const poisoned = { ...stored, _type: 'io.cozy.settings' }
    const client = clientReturning(poisoned)

    await dismiss(client, poisoned, { dismissedAt: at })

    expect(client.save.mock.calls[0][0]._type).toBe(BANNERS_DOCTYPE)
  })

  it('should not report a failed read as a deleted banner', async () => {
    // client.query resolves undefined when the client swallows the rejection
    // through its onError option. Reporting that as {data: null} would tell the
    // caller the banner is gone while nothing was written.
    const client = {
      query: jest.fn().mockResolvedValue(undefined),
      save: jest.fn()
    }

    await expect(dismiss(client, stored, { dismissedAt: at })).rejects.toThrow(
      'resolved nothing'
    )
    expect(client.save).not.toHaveBeenCalled()
  })

  it('should not swallow any other error', async () => {
    const boom = Object.assign(new Error('Server error'), { status: 500 })
    const client = clientReturning(stored, jest.fn().mockRejectedValue(boom))

    await expect(dismiss(client, stored)).rejects.toThrow('Server error')
  })
})
