const OriginalLoop = require('./loop').default

describe('loop', () => {
  let time
  let testLoop
  let fn

  const interval = 100

  beforeEach(() => {
    time = 0
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const scheduleForward = duration => {
    time = time + duration
    return Promise.resolve().then(() => jest.advanceTimersByTime(duration))
  }

  // Sleep working in conjunction with fakeTimers
  // https://stackoverflow.com/questions/51126786/jest-fake-timers-with-promises
  const sleep = duration => {
    scheduleForward(duration)
    return new Promise(resolve => setTimeout(resolve, duration))
  }

  // Specific to tests, after each round we advance jest timers
  const afterRound = async () => {
    await scheduleForward(interval)
  }

  // We have to customize loop only for tests, to be able to use Jest timers
  const Loop = function(task, delay) {
    return new OriginalLoop(task, delay, afterRound, sleep)
  }

  it('should call a function periodically, and wait for the end of a task to schedule another one', done => {
    let i = 0
    const longTaskDuration = interval * 6
    const limit = 900

    const finish = () => {
      testLoop.stop()
      // Since a task took longer than the other ones and because each task waits for the
      // end of the previous one to start, `fn` is expected to be called less than limit
      // divided by interval
      expect(fn).toHaveBeenCalledTimes(4)
      done()
    }

    fn = jest.fn().mockImplementation(async () => {
      i++
      if (i === 2) {
        // One task takes longer than expected
        await sleep(longTaskDuration)
      } else if (time >= limit) {
        finish()
      }
    })

    testLoop = new Loop(fn, interval)
    testLoop.start()
  })

  it('should be able to schedule a task immediately', done => {
    const interval = 100
    const limit = 500
    let i = 0
    const order = []

    const finish = () => {
      testLoop.stop()
      expect(fn).toHaveBeenCalledTimes(5)
      expect(order).toEqual([1, 2, 'immediate', 3, 4])
      done()
    }

    fn = jest.fn().mockImplementation(async () => {
      i++
      if (i === 2) {
        // Add immediate task
        testLoop.scheduleImmediateTask(() => {
          order.push('immediate')
        })
      } else if (time >= limit) {
        finish()
      }
      order.push(i)
    })

    testLoop = new Loop(fn, interval)
    testLoop.start()
  })
})
