import { renderHook } from '@testing-library/react-hooks'

import { createMockClient } from '../mock'
import { makeWrapper } from '../testing/utils'
import useAppsInMaintenance from './useAppsInMaintenance'

const appsInMaintenance = [
  {
    _id: 'caissedepargne1',
    slug: 'caissedepargne1'
  },
  {
    _id: 'boursorama',
    slug: 'boursorama'
  }
]

const mockClient = createMockClient({
  queries: {
    'io.cozy.apps_registry/maintenance': {
      data: appsInMaintenance,
      doctype: 'io.cozy.apps_registry'
    }
  }
})

describe('useAppsInMaintenance', () => {
  it('should return apps in maintenance', () => {
    const { result } = renderHook(() => useAppsInMaintenance(), {
      wrapper: makeWrapper(mockClient)
    })

    expect(result.current).toMatchObject(appsInMaintenance)
  })
})
