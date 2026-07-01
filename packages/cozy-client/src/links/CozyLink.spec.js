import CozyLink, { chain } from './CozyLink'

describe('CozyLink', () => {
  it('should be chainable', () => {
    const link = chain([
      new CozyLink((operation, options, result = '', forward) => {
        return forward(operation, options, result + 'foo')
      }),
      new CozyLink((operation, options, result, forward) => {
        return forward(operation, options, result + 'bar')
      }),
      (operation, options, result) => {
        return result + 'baz'
      }
    ])
    expect(link.request('dummyOperation')).toBe('foobarbaz')
  })

  it('has name === undefined by default', () => {
    const link = new CozyLink()
    expect(link.name).toBe(undefined)
  })

  describe('default last link', () => {
    it('should throw an error when called without result', () => {
      const link = chain([
        new CozyLink((operation, options, result = '', forward) => {
          return forward(operation, options)
        })
      ])
      expect(() =>
        link.request('dummyOperation')
      ).toThrowErrorMatchingSnapshot()
    })

    it('should return the final result if there is one', () => {
      const link = chain([
        new CozyLink((operation, options, result, forward) => {
          return forward(operation, options, 'foo')
        })
      ])

      expect(link.request('dummyOperation')).toBe('foo')
    })

    it('should call the custom execution function', () => {
      const link = chain([
        new CozyLink((operation, options, result = '', forward) => {
          return forward(operation, options)
        })
      ])
      const spyFn = jest.fn(() => 'bar')
      expect(
        link.request({
          type: 'dummyOperation',
          execute: spyFn
        })
      ).toBe('bar')
      expect(spyFn).toHaveBeenCalled()
    })
  })
})
