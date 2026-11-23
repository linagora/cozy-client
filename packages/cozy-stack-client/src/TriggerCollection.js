import Collection, { dontThrowNotFoundError } from './Collection'
import { normalizeDoctypeJsonApi } from './normalize'
import { normalizeJob } from './JobCollection'
import { uri } from './utils'
import DocumentCollection from './DocumentCollection'

export const JOBS_DOCTYPE = 'io.cozy.jobs'
export const TRIGGERS_DOCTYPE = 'io.cozy.triggers'

export const normalizeTrigger = normalizeDoctypeJsonApi(TRIGGERS_DOCTYPE)

export const isForKonnector = (triggerAttrs, slug) => {
  return (
    triggerAttrs.worker === 'konnector' &&
    triggerAttrs.message.konnector == slug
  )
}

export const isForAccount = (triggerAttrs, accountId) => {
  return triggerAttrs.message.account == accountId
}

const buildParamsUrl = (worker, type) => {
  const urlParams = new URLSearchParams()

  if (worker) {
    if (Array.isArray(worker.$in)) {
      urlParams.set('Worker', worker.$in.join(','))
    } else {
      urlParams.set('Worker', worker)
    }
  }
  if (type) {
    if (Array.isArray(type.$in)) {
      urlParams.set('Type', type.$in.join(','))
    } else {
      urlParams.set('Type', type)
    }
  }
  return urlParams.toString()
}

/**
 * Implements `DocumentCollection` API along with specific methods for `io.cozy.triggers`.
 */
class TriggerCollection extends DocumentCollection {
  constructor(stackClient) {
    super(TRIGGERS_DOCTYPE, stackClient)
  }

  /**
   * Get the list of triggers.
   *
   * @see https://docs.cozy.io/en/cozy-stack/jobs/#get-jobstriggers
   * @param  {{Worker}} options The fetch options: Worker allow to filter only triggers associated with a specific worker.
   * @returns {{data}} The JSON API conformant response.
   * @throws {FetchError}
   */
  async all(options = {}) {
    try {
      const resp = await this.stackClient.fetchJSON('GET', `/jobs/triggers`)

      return {
        data: resp.data.map(row => normalizeTrigger(row)),
        meta: { count: resp.data.length },
        next: false,
        skip: 0
      }
    } catch (error) {
      return dontThrowNotFoundError(error)
    }
  }

  /**
   * Creates a Trigger document
   *
   * @see https://docs.cozy.io/en/cozy-stack/jobs/#post-jobstriggers
   * @param  {object}  attributes Trigger's attributes
   * @returns {object}  Stack response, containing trigger document under `data` attribute.
   */
  async create(attributes) {
    const path = uri`/jobs/triggers`
    const resp = await this.stackClient.fetchJSON('POST', path, {
      data: {
        attributes
      }
    })
    return {
      data: normalizeTrigger(resp.data)
    }
  }

  /**
   * Deletes a trigger
   *
   * @see https://docs.cozy.io/en/cozy-stack/jobs/#delete-jobstriggerstrigger-id
   * @param  {object} document The trigger to delete — must have an _id field
   * @returns {object} The deleted document
   */
  async destroy(document) {
    const { _id } = document
    if (!_id) {
      throw new Error('TriggerCollection.destroy needs a document with an _id')
    }
    await this.stackClient.fetchJSON('DELETE', uri`/jobs/triggers/${_id}`)
    return {
      data: normalizeTrigger({ ...document, _deleted: true })
    }
  }
  /**
   *
   * Be warned, ATM /jobs/triggers does not return the same informations
   * than /data/io.cozy.triggers (used by the super.find method).
   *
   * See https://github.com/cozy/cozy-stack/pull/2010
   *
   * @param {object} selector - Which kind of worker {konnector,service}
   * @param {object} options - Options
   * @returns {{data, meta, skip, next}} The JSON API conformant response.
   * @throws {FetchError}
   */
  async find(selector = {}, options = {}) {
    const { worker, type, ...rest } = selector
    const hasOnlyWorkerAndType =
      Object.keys(rest).length === 0 && !options.partialFilter
    if (hasOnlyWorkerAndType) {
      // @see https://github.com/cozy/cozy-stack/blob/master/docs/jobs.md#get-jobstriggers
      const url = `/jobs/triggers?${buildParamsUrl(worker, type)}`

      try {
        const resp = await this.stackClient.fetchJSON('GET', url)

        return {
          data: resp.data.map(row => normalizeTrigger(row)),
          meta: { count: resp.data.length },
          next: false,
          skip: 0
        }
      } catch (error) {
        return dontThrowNotFoundError(error)
      }
    } else {
      return super.find(selector, options)
    }
  }

  async get(id) {
    return Collection.get(this.stackClient, uri`/jobs/triggers/${id}`, {
      normalize: normalizeTrigger
    })
  }

  /**
   * Force given trigger execution.
   *
   * @see https://docs.cozy.io/en/cozy-stack/jobs/#post-jobstriggerstrigger-idlaunch
   * @param {object} trigger Trigger to launch
   * @returns {object} Stack response, containing job launched by trigger, under `data` attribute.
   */
  async launch(trigger) {
    const path = uri`/jobs/triggers/${trigger._id}/launch`
    const resp = await this.stackClient.fetchJSON('POST', path)
    return {
      data: normalizeJob(resp.data)
    }
  }

  /**
   * Updates a Trigger document. Only updatable attributes plus _id are allowed.
   *
   * @param  {object}  trigger Trigger's attributes to update + id
   * @returns {object}  Stack response, containing resulting trigger document under `data` attribute.
   */
  async update(trigger) {
    for (const key in trigger) {
      if (
        ![
          '_id',
          '_rev',
          '_type',
          'arguments',
          'message',
          'cozyMetadata'
        ].includes(key)
      ) {
        throw new Error(
          `TriggerCollection.update only works for 'arguments', and 'message' attributes.`
        )
      }
    }

    const attributes = {
      ...(trigger.arguments ? { arguments: trigger.arguments } : {}),
      ...(trigger.message ? { message: trigger.message } : {})
    }

    const triggerUpdateResult = await this.stackClient.fetchJSON(
      'PATCH',
      `/jobs/triggers/${trigger._id}`,
      {
        data: {
          attributes
        }
      }
    )
    return {
      data: normalizeTrigger(triggerUpdateResult.data)
    }
  }
}

TriggerCollection.normalizeDoctype = normalizeDoctypeJsonApi

export default TriggerCollection
