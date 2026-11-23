import StackClient from './CozyStackClient'
import JobCollection from './JobCollection'

describe('job collection', () => {
  let stackClient, col

  beforeAll(() => {
    stackClient = new StackClient()
  })

  beforeEach(() => {
    jest.spyOn(stackClient, 'fetchJSON').mockResolvedValue({})
    col = new JobCollection(stackClient)
  })

  it('should call the right route when creating & defaulting manual to false', async () => {
    await col.create('service', {
      message: {
        name: 'categorization',
        slug: 'banks'
      }
    })
    expect(stackClient.fetchJSON).toHaveBeenCalledWith(
      'POST',
      '/jobs/queue/service',
      {
        data: {
          attributes: {
            arguments: { message: { name: 'categorization', slug: 'banks' } },
            manual: false,
            options: {}
          },
          type: 'io.cozy.jobs'
        }
      }
    )
  })

  it('should call the right route when creating & set manual to true', async () => {
    await col.create(
      'service',
      {
        message: {
          name: 'categorization',
          slug: 'banks'
        }
      },
      {},
      true
    )
    expect(stackClient.fetchJSON).toHaveBeenCalledWith(
      'POST',
      '/jobs/queue/service',
      {
        data: {
          attributes: {
            arguments: { message: { name: 'categorization', slug: 'banks' } },
            manual: true,
            options: {}
          },
          type: 'io.cozy.jobs'
        }
      }
    )
  })

  it('should call the right route when fetching queued jobs', async () => {
    await col.queued('service')
    expect(stackClient.fetchJSON).toHaveBeenCalledWith(
      'GET',
      '/jobs/queue/service'
    )
  })

  describe('get', () => {
    beforeEach(() => {
      jest.spyOn(stackClient, 'fetchJSON').mockResolvedValue({
        data: {
          type: 'io.cozy.jobs',
          id: '5396fc6299dd437d8d30fecd44745745',
          attributes: {
            domain: 'me.cozy.tools',
            worker: 'sendmail',
            options: {
              priority: 3,
              timeout: 60,
              max_exec_count: 3
            },
            state: 'running',
            queued_at: '2016-09-19T12:35:08Z',
            started_at: '2016-09-19T12:35:08Z',
            error: ''
          },
          links: {
            self: '/jobs/5396fc6299dd437d8d30fecd44745745'
          }
        }
      })
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should call the expected stack endpoint', async () => {
      const jobId = '5396fc6299dd437d8d30fecd44745745'
      await col.get(jobId)
      expect(stackClient.fetchJSON).toHaveBeenCalledWith(
        'GET',
        '/jobs/5396fc6299dd437d8d30fecd44745745'
      )
    })
  })

  describe('update', () => {
    beforeEach(() => {
      jest.spyOn(stackClient, 'fetchJSON').mockResolvedValue({
        data: {
          type: 'io.cozy.jobs',
          id: '5396fc6299dd437d8d30fecd44745745',
          attributes: {
            domain: 'me.cozy.tools',
            worker: 'konnector',
            state: 'done',
            queued_at: '2016-09-19T12:35:08Z',
            started_at: '2016-09-19T12:35:08Z',
            error: ''
          },
          links: {
            self: '/jobs/5396fc6299dd437d8d30fecd44745745'
          }
        }
      })
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should return a normalized jobs', async () => {
      const jobId = '5396fc6299dd437d8d30fecd44745745'
      const job = await col.update({
        _id: jobId,
        worker: 'client',
        attributes: {
          state: 'done'
        }
      })
      expect(job).toEqual(
        expect.objectContaining({
          _type: 'io.cozy.jobs',
          state: 'done',
          _id: jobId
        })
      )
    })
    it('should call the expected stack endpoint when ok job', async () => {
      const jobId = '5396fc6299dd437d8d30fecd44745745'
      await col.update({
        _id: jobId,
        worker: 'client',
        attributes: {
          state: 'done'
        }
      })
      expect(stackClient.fetchJSON).toHaveBeenCalledWith(
        'PATCH',
        '/jobs/' + jobId,
        {
          data: {
            type: 'io.cozy.jobs',
            id: jobId,
            attributes: {
              state: 'done'
            }
          }
        }
      )
    })

    it('should call the expected stack endpoint when error job', async () => {
      const jobId = '5396fc6299dd437d8d30fecd44745745'
      await col.update({
        _id: jobId,
        worker: 'client',
        attributes: {
          state: 'errored',
          error: 'LOGIN_FAILED'
        }
      })
      expect(stackClient.fetchJSON).toHaveBeenCalledWith(
        'PATCH',
        '/jobs/' + jobId,
        {
          data: {
            type: 'io.cozy.jobs',
            id: jobId,
            attributes: {
              state: 'errored',
              error: 'LOGIN_FAILED'
            }
          }
        }
      )
    })

    it('should throw when the job is not a client worker', async () => {
      expect.assertions(1)
      const jobId = '5396fc6299dd437d8d30fecd44745745'
      try {
        await col.update({
          _id: jobId,
          worker: 'notclient',
          attributes: {
            state: 'errored',
            error: 'LOGIN_FAILED'
          }
        })
      } catch (err) {
        expect(err.message).toEqual(
          `JobCollection.update only works for client workers. notclient given`
        )
      }
    })
  })

  describe('waitFor', () => {
    it('should work', async () => {
      let i = 0
      jest.spyOn(col, 'get').mockImplementation(() => {
        const state = i++ < 2 ? 'pending' : 'done'
        return { data: { attributes: { state } } }
      })
      const finalJob = await col.waitFor('jobId', { delay: 1 })
      expect(col.get).toHaveBeenCalledTimes(3)
      expect(finalJob.state).toBe('done')
    })
  })
})
