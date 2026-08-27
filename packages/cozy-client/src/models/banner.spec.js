import {
  BANNERS_DOCTYPE,
  BANNERS_QUERY_NAME,
  getActiveBanner,
  getActiveBanners,
  byPriority,
  dismiss,
  getCta,
  getSeverity,
  getSurface,
  getVisibleBanners,
  isDismissed,
  isInWindow,
  isSupported,
  isTrusted
} from './banner'
import vectors from './__fixtures__/io.cozy.banners.json'
import MockDate from 'mockdate'

/**
 * The fixtures are the shared contract vectors published with the doctype in
 * cozy-doctypes (fixtures/io.cozy.banners.json). Every client implementing
 * io.cozy.banners runs the same cases, so the implementations are checked
 * against one specification rather than against each other.
 */
describe('io.cozy.banners contract vectors', () => {
  const now = new Date(vectors.now)

  it.each(vectors.cases.map(testCase => [testCase.name, testCase]))(
    '%s',
    (name, testCase) => {
      const visible = getVisibleBanners(testCase.input, {
        now,
        supportedDoctypeVersion:
          testCase.supportedDoctypeVersion ?? vectors.supportedDoctypeVersion
      })

      // No helper calls: getVisibleBanners returns banners ready to render,
      // with every fallback already applied.
      const rendered = visible.map(banner => ({
        bannerId: banner.bannerId,
        severity: banner.severity,
        surface: banner.surface,
        cta: banner.cta !== null
      }))

      expect(rendered).toEqual(testCase.expected)
    }
  )
})

describe('isTrusted', () => {
  it('should reject a document written by an application', () => {
    expect(isTrusted({ cozyMetadata: { createdByApp: 'drive' } })).toBe(false)
  })

  it('should reject a document with no metadata', () => {
    expect(isTrusted({})).toBe(false)
    expect(isTrusted(undefined)).toBe(false)
  })
})

const stackBanner = attributes => ({
  bannerId: 'quota.exceeded',
  category: 'quota',
  severity: 'info',
  surface: 'banner',
  text: 'Message.',
  lang: 'en',
  dismissible: true,
  dismissedAt: null,
  priority: 50,
  startsAt: '2026-07-01T00:00:00Z',
  endsAt: null,
  cozyMetadata: {
    createdByApp: 'stack',
    doctypeVersion: 1,
    metadataVersion: 1
  },
  ...attributes
})

const now = new Date('2026-07-22T12:00:00Z')
const idsOf = banners => banners.map(banner => banner.bannerId)

describe('getSurface', () => {
  it('should keep every surface the doctype defines', () => {
    expect(getSurface({ surface: 'banner' })).toBe('banner')
    expect(getSurface({ surface: 'modal' })).toBe('modal')
  })

  it('should fall back for a surface the doctype no longer defines', () => {
    expect(getSurface({ surface: 'inline' })).toBe('banner')
  })
})

describe('getSeverity', () => {
  it('should keep every severity the doctype defines', () => {
    expect(getSeverity({ severity: 'info' })).toBe('info')
    expect(getSeverity({ severity: 'warning' })).toBe('warning')
    expect(getSeverity({ severity: 'error' })).toBe('error')
  })
})

describe('getCta', () => {
  it('should drop a call to action with no readable label', () => {
    expect(getCta({ cta: { url: 'https://example.org' } })).toBe(null)
    expect(getCta({ cta: { label: '', url: 'https://example.org' } })).toBe(
      null
    )
    // Whitespace and a zero width space render as a button with nothing on it.
    expect(getCta({ cta: { label: '  ', url: 'https://example.org' } })).toBe(
      null
    )
    expect(
      getCta({ cta: { label: '\u200B', url: 'https://example.org' } })
    ).toBe(null)
  })

  it('should accept a scheme written in any case', () => {
    const cta = { label: 'Upgrade', url: 'HTTPS://example.org' }
    expect(getCta({ cta })).toBe(cta)
  })
})

describe('isInWindow', () => {
  it('should hide a banner whose window cannot be read', () => {
    expect(isInWindow(stackBanner({ endsAt: 'not-a-date' }), now)).toBe(false)
    expect(isInWindow(stackBanner({ startsAt: '2026-13-45' }), now)).toBe(false)
  })

  it('should hide a banner with no start bound rather than treat it as open', () => {
    // startsAt is not one of the fields the doctype allows to be missing, so an
    // absent one is an unreadable window. Treating it as "no lower bound" would
    // make deleting the field enough to turn a scheduled banner into a
    // permanent one, which anything able to rewrite the document could do.
    expect(isInWindow(stackBanner({ startsAt: undefined }), now)).toBe(false)
    expect(isInWindow(stackBanner({ startsAt: null }), now)).toBe(false)
    expect(
      idsOf(
        getVisibleBanners(
          [stackBanner({ startsAt: undefined, endsAt: null })],
          {
            now
          }
        )
      )
    ).toEqual([])
  })

  it('should default to the current time', () => {
    MockDate.set('2026-07-22T12:00:00Z')
    try {
      expect(
        isInWindow(stackBanner({ startsAt: '2026-08-01T00:00:00Z' }))
      ).toBe(false)
      expect(isInWindow(stackBanner())).toBe(true)
    } finally {
      MockDate.reset()
    }
  })
})

describe('isDismissed', () => {
  it('should read an absent value as not dismissed', () => {
    expect(isDismissed({ dismissedAt: null })).toBe(false)
    expect(isDismissed({})).toBe(false)
    expect(isDismissed(undefined)).toBe(false)
  })
})

describe('isSupported', () => {
  it('should default to the version this client was written against', () => {
    expect(isSupported(stackBanner())).toBe(true)
  })
})

describe('byPriority', () => {
  it('should order equal priorities by code unit rather than by locale', () => {
    const banners = [{ bannerId: 'a.x' }, { bannerId: 'B.x' }]
    expect(idsOf([...banners].sort(byPriority))).toEqual(['B.x', 'a.x'])
  })

  it('should stay transitive when a priority is missing', () => {
    const high = { bannerId: 'z.high', priority: 100 }
    const none = { bannerId: 'm.none' }
    const low = { bannerId: 'a.low', priority: 10 }

    expect(byPriority(high, none)).toBeLessThan(0)
    expect(byPriority(none, low)).toBeGreaterThan(0)
    expect(byPriority(high, low)).toBeLessThan(0)
  })
})

describe('getVisibleBanners', () => {
  it('should not let an out of window version hide a live one', () => {
    const live = stackBanner({ _id: 'v1' })
    const future = stackBanner({
      _id: 'v2',
      startsAt: '2026-08-01T00:00:00Z',
      cozyMetadata: { createdByApp: 'stack', doctypeVersion: 2 }
    })

    const visible = getVisibleBanners([live, future], {
      now,
      supportedDoctypeVersion: 2
    })

    expect(idsOf(visible)).toEqual(['quota.exceeded'])
  })

  it('should keep a bannerId hidden once any of its versions is dismissed', () => {
    const dismissed = stackBanner({
      _id: 'v1',
      dismissedAt: '2026-07-20T00:00:00Z'
    })
    const upgraded = stackBanner({
      _id: 'v2',
      cozyMetadata: { createdByApp: 'stack', doctypeVersion: 2 }
    })

    const visible = getVisibleBanners([dismissed, upgraded], {
      now,
      supportedDoctypeVersion: 2
    })

    expect(visible).toEqual([])
  })

  it('should not depend on the order the documents came back in', () => {
    const older = stackBanner({
      _id: 'a',
      priority: 10,
      cozyMetadata: {
        createdByApp: 'stack',
        doctypeVersion: 1,
        updatedAt: '2026-07-01T00:00:00Z'
      }
    })
    const newer = stackBanner({
      _id: 'b',
      priority: 90,
      cozyMetadata: {
        createdByApp: 'stack',
        doctypeVersion: 1,
        updatedAt: '2026-07-10T00:00:00Z'
      }
    })

    const one = getVisibleBanners([older, newer], { now })
    const other = getVisibleBanners([newer, older], { now })

    expect(one).toEqual(other)
    expect(one[0]._id).toBe('b')
  })

  it('should keep documents that lost their bannerId apart', () => {
    const first = stackBanner({ _id: 'a', bannerId: undefined })
    const second = stackBanner({ _id: 'b', bannerId: undefined })

    expect(getVisibleBanners([first, second], { now })).toHaveLength(2)
  })

  it('should ignore a dismissal recorded by anything but the stack', () => {
    // An application holding write permission on the doctype could otherwise
    // suppress a platform message by authoring a dismissed document of its own,
    // without touching the one the stack wrote.
    const live = stackBanner({ _id: 'stack' })
    const forged = stackBanner({
      _id: 'forged',
      dismissedAt: '2026-07-20T00:00:00Z',
      cozyMetadata: { createdByApp: 'drive', doctypeVersion: 1 }
    })

    expect(idsOf(getVisibleBanners([forged, live], { now }))).toEqual([
      'quota.exceeded'
    ])
  })

  it('should not leave a blocking modal without a way out', () => {
    // The doctype guarantees a non dismissible modal carries a call to action.
    // Dropping an unusable one must not paint a dialog with no dismiss control
    // and no button.
    const trapped = stackBanner({
      surface: 'modal',
      dismissible: false,
      cta: { label: 'Upgrade', url: 'http://example.org/plans' }
    })

    const [visible] = getVisibleBanners([trapped], { now })

    expect(visible.cta).toBeNull()
    expect(visible.surface).toBe('banner')
  })

  it('should keep a modal whose call to action survived', () => {
    const usable = stackBanner({
      surface: 'modal',
      dismissible: false,
      cta: { label: 'Upgrade', url: 'https://example.org/plans' }
    })

    expect(getVisibleBanners([usable], { now })[0].surface).toBe('modal')
  })

  it('should not let a version written as null lose to its older sibling', () => {
    // Number(null) is a finite 0, so an unusable version must not be read as a
    // real one: it would lose the version comparison outright and render the
    // stale document.
    const fresher = stackBanner({
      _id: 'fresher',
      surface: 'modal',
      cozyMetadata: {
        createdByApp: 'stack',
        doctypeVersion: null,
        updatedAt: '2026-07-20T00:00:00Z'
      }
    })
    const stale = stackBanner({
      _id: 'stale',
      cozyMetadata: {
        createdByApp: 'stack',
        doctypeVersion: '1',
        updatedAt: '2026-07-01T00:00:00Z'
      }
    })

    expect(getVisibleBanners([fresher, stale], { now })[0]._id).toBe('fresher')
  })

  it('should fall back on the supported version when the option is unusable', () => {
    // ?? would let NaN through, and every `version <= NaN` is false, so the
    // whole feature would go dark with no error.
    expect(
      idsOf(
        getVisibleBanners([stackBanner()], {
          now,
          supportedDoctypeVersion: Number('nope')
        })
      )
    ).toEqual(['quota.exceeded'])
  })

  it('should keep bannerId and _id in separate identities', () => {
    // A document that lost its bannerId keys on its _id, which must not collide
    // with another document whose bannerId happens to be that same string.
    const dismissedNoId = stackBanner({
      _id: 'quota.exceeded',
      bannerId: undefined,
      dismissedAt: '2026-07-20T00:00:00Z'
    })
    const live = stackBanner({ _id: 'other' })

    expect(idsOf(getVisibleBanners([dismissedNoId, live], { now }))).toEqual([
      'quota.exceeded'
    ])
  })

  it('should order documents that lost their bannerId deterministically', () => {
    const first = stackBanner({ _id: 'zzz', bannerId: undefined })
    const second = stackBanner({ _id: 'aaa', bannerId: undefined })

    const one = getVisibleBanners([first, second], { now }).map(b => b._id)
    const other = getVisibleBanners([second, first], { now }).map(b => b._id)

    expect(one).toEqual(['aaa', 'zzz'])
    expect(one).toEqual(other)
  })

  it('should return the stored document when no fallback applied', () => {
    // The store relies on referential equality, so an untouched banner must not
    // be copied on every read.
    const clean = stackBanner({ cta: null })

    expect(getVisibleBanners([clean], { now })[0]).toBe(clean)
  })

  it('should fall back on the clock when now is unusable', () => {
    // The banner is live at the frozen clock, so this separates the guard from
    // isInWindow's own rejection of a NaN time, which would hide it instead.
    const live = stackBanner()

    MockDate.set('2026-07-22T12:00:00Z')
    try {
      expect(
        idsOf(getVisibleBanners([live], { now: new Date('nope') }))
      ).toEqual(['quota.exceeded'])
      expect(
        idsOf(getVisibleBanners([live], { now: '2026-07-22T12:00:00Z' }))
      ).toEqual(['quota.exceeded'])
    } finally {
      MockDate.reset()
    }
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
    const [resolved] = getVisibleBanners([
      {
        ...stored,
        category: 'quota',
        text: 'hi',
        lang: 'en',
        dismissible: true,
        priority: 1,
        startsAt: '2020-01-01T00:00:00Z',
        endsAt: null,
        cozyMetadata: { createdByApp: 'stack', doctypeVersion: 1 }
      }
    ])
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
        // the collection lookup for every version of the bannerId
        .mockResolvedValueOnce({ data: [stored] })
        // the read by id, then the re-read after the conflict
        .mockResolvedValueOnce({ data: stored })
        .mockResolvedValue({ data: fresh }),
      save: jest
        .fn()
        .mockRejectedValueOnce(conflict)
        .mockResolvedValue({})
    }

    await dismiss(client, stored, { dismissedAt: at })

    expect(client.query).toHaveBeenCalledTimes(3)
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

describe('getCta url validation', () => {
  const withUrl = url => ({ cta: { label: 'Go', url } })

  it('should keep an absolute https URL', () => {
    expect(getCta(withUrl('https://example.org/plans'))).not.toBeNull()
  })

  it.each([
    ['https://', 'a scheme with no host'],
    ['http://example.org', 'plain http'],
    ['javascript:alert(1)', 'a script scheme'],
    ['//example.org', 'a protocol relative URL'],
    ['/plans', 'a relative path']
  ])('should drop %s (%s)', url => {
    expect(getCta(withUrl(url))).toBeNull()
  })
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
    dismissible: true,
    dismissedAt: null,
    priority: 10,
    startsAt: '2020-01-01T00:00:00Z',
    endsAt: null,
    cozyMetadata: { createdByApp: 'stack', doctypeVersion: '1' }
  }

  it('should query and return banners ready to render', async () => {
    const client = { query: jest.fn().mockResolvedValue({ data: [stored] }) }

    const banners = await getActiveBanners(client)

    // asserted precisely: passing the { definition, options } wrapper instead
    // of the definition itself throws "Cannot init query with no doctype" at
    // runtime, which a permissive mock hides.
    const [definition, queryOptions] = client.query.mock.calls[0]
    expect(definition.doctype).toBe(BANNERS_DOCTYPE)
    // Named under its own key rather than the bare doctype: client.query keys
    // the store entry on the name but the in flight promise on the definition,
    // so sharing the name with another query makes this one resolve nothing.
    expect(queryOptions.as).toBe(BANNERS_QUERY_NAME)
    expect(BANNERS_QUERY_NAME).not.toBe(BANNERS_DOCTYPE)
    expect(banners).toHaveLength(1)
    // fallbacks already applied, so the caller renders what it is given
    expect(banners[0].severity).toBe('warning')
    expect(banners[0].surface).toBe('banner')
  })

  it('should cope with an empty or missing collection', async () => {
    for (const data of [[], null, undefined]) {
      const client = { query: jest.fn().mockResolvedValue({ data }) }
      await expect(getActiveBanners(client)).resolves.toEqual([])
    }
  })

  it('should read a collection the pouch link resolves as a bare object', async () => {
    const client = { query: jest.fn().mockResolvedValue({ data: stored }) }
    await expect(getActiveBanners(client)).resolves.toEqual([])
  })

  it('should not report a query that resolved nothing as an empty instance', async () => {
    const client = { query: jest.fn().mockResolvedValue(undefined) }
    await expect(getActiveBanners(client)).rejects.toThrow('resolved nothing')
  })
})

describe('getActiveBanner', () => {
  it('should return the highest priority banner', async () => {
    const low = {
      _id: 'a',
      bannerId: 'low',
      severity: 'info',
      surface: 'banner',
      priority: 1,
      dismissedAt: null,
      startsAt: '2020-01-01T00:00:00Z',
      endsAt: null,
      cozyMetadata: { createdByApp: 'stack', doctypeVersion: '1' }
    }
    const high = { ...low, _id: 'b', bannerId: 'high', priority: 99 }
    const client = { query: jest.fn().mockResolvedValue({ data: [low, high] }) }

    const banner = await getActiveBanner(client)

    expect(banner.bannerId).toBe('high')
  })

  it('should return null when nothing applies', async () => {
    const client = { query: jest.fn().mockResolvedValue({ data: [] }) }
    await expect(getActiveBanner(client)).resolves.toBeNull()
  })
})

describe('dismiss across versions', () => {
  const at = '2026-08-28T10:00:00Z'
  const v1 = {
    _id: 'v1doc',
    bannerId: 'quota.exceeded',
    dismissedAt: null,
    cozyMetadata: { createdByApp: 'stack', doctypeVersion: '1' }
  }
  const v2 = {
    ...v1,
    _id: 'v2doc',
    cozyMetadata: { ...v1.cozyMetadata, doctypeVersion: '2' }
  }
  const other = { ...v1, _id: 'otherdoc', bannerId: 'billing.failed' }

  it('should write the dismissal to every version of the bannerId', async () => {
    const byId = { v1doc: v1, v2doc: v2, otherdoc: other }
    const client = {
      query: jest
        .fn()
        .mockImplementation(definition =>
          Promise.resolve(
            definition?.id
              ? { data: byId[definition.id] }
              : { data: [v1, v2, other] }
          )
        ),
      save: jest.fn().mockImplementation(doc => Promise.resolve({ data: doc }))
    }

    await dismiss(client, v1, { dismissedAt: at })

    const written = client.save.mock.calls.map(([doc]) => doc._id).sort()
    expect(written).toEqual(['v1doc', 'v2doc'])
    // the sibling under a different bannerId is left alone
    expect(written).not.toContain('otherdoc')
  })

  it('should answer with the document the caller asked about', async () => {
    const client = {
      query: jest
        .fn()
        .mockImplementation(definition =>
          Promise.resolve(
            definition?.id
              ? { data: definition.id === 'v1doc' ? v1 : v2 }
              : { data: [v1, v2] }
          )
        ),
      save: jest.fn().mockImplementation(doc => Promise.resolve({ data: doc }))
    }

    const result = await dismiss(client, v2, { dismissedAt: at })

    expect(result.data._id).toBe('v2doc')
  })
})
