import get from 'lodash/get'

import {
  transformRegistryFormatToStackFormat,
  registryEndpoint
} from 'cozy-client/dist/registry'

import Collection from './Collection'
import DocumentCollection from './DocumentCollection'
import logger from './logger'
import { normalizeDoctypeJsonApi } from './normalize'

export const APPS_DOCTYPE = 'io.cozy.apps'

export const normalizeApp = (app, doctype) => {
  const normalizedApp = normalizeDoctypeJsonApi(doctype)(app)
  return {
    ...normalizedApp,
    id: app.id // ignores any 'id' attribute in the manifest
  }
}

/**
 * Extends `DocumentCollection` API along with specific methods for `io.cozy.apps`.
 */
class AppCollection extends DocumentCollection {
  constructor(stackClient) {
    super(APPS_DOCTYPE, stackClient)
    this.endpoint = '/apps/'
  }

  async get(idArg, query) {
    let id
    if (idArg.indexOf('/') > -1) {
      id = idArg.split('/')[1]
    } else {
      logger.warn(
        `Deprecated: in next versions of cozy-client, it will not be possible to query apps/konnectors only with id, please use the form ${this.doctype}/${idArg}

- Q('io.cozy.apps').getById('banks')
+ Q('io.cozy.apps').getById('io.cozy.apps/banks')`
      )
      id = idArg
    }
    if (
      query &&
      query.sources &&
      (!Array.isArray(query.sources) || query.sources.length === 0)
    ) {
      throw new Error(
        'Invalid "sources" attribute passed in query, please use an array with at least one element.'
      )
    }

    const sources = get(query, 'sources', ['stack'])

    const dataFetchers = {
      stack: () =>
        Collection.get(
          this.stackClient,
          `${this.endpoint}${encodeURIComponent(id)}`,
          {
            normalize: data => normalizeApp(data, this.doctype)
          }
        ),
      registry: () => this.stackClient.fetchJSON('GET', registryEndpoint + id)
    }

    for (const source of sources) {
      try {
        const res = await dataFetchers[source]()
        if (source !== 'registry') {
          return res
        }

        logger.warn(
          `The use of source registry is deprecated since it can polute the io.cozy.apps slice. For exemple, if we request data from the registry, than the app will be present in the io.cozy.apps slice and then the isInstalled() will return true.\n
            Use Q('io.cozy.apps_registry) instead`
        )

        const data = transformRegistryFormatToStackFormat(res)
        return { data: normalizeApp(data, this.doctype) }
      } catch (err) {
        if (source === sources[sources.length - 1]) {
          throw err
        }
      }
    }
  }

  /**
   * Lists all apps, without filters.
   *
   * The returned documents are not paginated by the stack.
   *
   * @returns {{data, meta, skip, next}} The JSON API conformant response.
   * @throws {FetchError}
   */
  async all() {
    const resp = await this.stackClient.fetchJSON('GET', this.endpoint)
    return {
      data: resp.data.map(app => normalizeApp(app, this.doctype)),
      meta: {
        count: resp.meta.count
      },
      skip: 0,
      next: false
    }
  }

  async create() {
    throw new Error('create() method is not available for applications')
  }

  async update() {
    throw new Error('update() method is not available for applications')
  }

  async destroy() {
    throw new Error('destroy() method is not available for applications')
  }
}

AppCollection.normalizeDoctype = normalizeDoctypeJsonApi

export default AppCollection
