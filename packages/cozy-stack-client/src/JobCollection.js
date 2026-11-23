import Collection from './Collection'
import DocumentCollection from './DocumentCollection'
import { normalizeDoctypeJsonApi } from './normalize'
import { uri } from './utils'

export const JOBS_DOCTYPE = 'io.cozy.jobs'

const sleep = delay => new Promise(resolve => setTimeout(resolve, delay))

export const normalizeJob = normalizeDoctypeJsonApi(JOBS_DOCTYPE)

export const hasJobFinished = job => {
  return job.state === 'done' || job.state === 'errored'
}

/**
 * Document representing a io.cozy.jobs
 *
 * @typedef {object} JobDocument
 * @property {string} _id - Id of the job
 * @property {string} attributes.state - state of the job. Can be 'errored', 'running', 'queued', 'done'
 * @property {string} attributes.error - Error message of the job if any
 */

class JobCollection extends DocumentCollection {
  constructor(stackClient) {
    super(JOBS_DOCTYPE, stackClient)
  }

  queued(workerType) {
    return this.stackClient.fetchJSON('GET', `/jobs/queue/${workerType}`)
  }

  /**
   * Creates a job
   *
   * @param  {string} workerType - Ex: "konnector"
   * @param  {object} [args={}] - Ex: {"slug": "my-konnector", "trigger": "trigger-id"}
   * @param  {object} [options={}] - creation options
   * @param  {boolean} [manual=false] -  Manual execution
   * @returns {object} createdJob
   */
  create(workerType, args = {}, options = {}, manual = false) {
    return this.stackClient.fetchJSON('POST', `/jobs/queue/${workerType}`, {
      data: {
        type: JOBS_DOCTYPE,
        attributes: {
          arguments: args,
          options: options,
          manual
        }
      }
    })
  }

  /**
   * Return a normalized job, given its id
   *
   * @param {string} id - id of the job
   * @returns {JobDocument}
   */
  async get(id) {
    return Collection.get(this.stackClient, uri`/jobs/${id}`, {
      normalize: normalizeJob
    })
  }

  /**
   * Update the job's state
   * This does work only for jobs comming from @client triggers
   *
   * @param {JobDocument} job - io.cozy.jobs document
   */
  async update(job) {
    if (job.worker !== 'client') {
      throw new Error(
        `JobCollection.update only works for client workers. ${job.worker} given`
      )
    }

    const jobResult = await this.stackClient.fetchJSON(
      'PATCH',
      `/jobs/${job._id}`,
      {
        data: {
          type: JOBS_DOCTYPE,
          id: job._id,
          attributes: {
            state: job.attributes.state,
            error: job.attributes.error
          }
        }
      }
    )

    return normalizeJob(jobResult.data)
  }

  /**
   * Polls a job state until it is finished
   *
   * `options.until` can be used to tweak when to stop waiting. It will be
   * given the current job state. If true is returned, the awaiting is
   * stopped.
   */
  async waitFor(
    id,
    {
      onUpdate = null,
      until = hasJobFinished,
      delay = 5 * 1000,
      timeout = 60 * 5 * 1000
    } = {}
  ) {
    const start = Date.now()
    let jobData = (await this.get(id)).data.attributes
    while (!jobData || !until(jobData)) {
      await sleep(delay)
      jobData = (await this.get(id)).data.attributes
      if (onUpdate) {
        onUpdate(jobData)
      }
      const now = Date.now()
      if (start - now > timeout) {
        throw new Error('Timeout for JobCollection::waitFor')
      }
    }
    return jobData
  }
}

export default JobCollection
