import '@testing-library/jest-dom'
import fetch from 'whatwg-fetch'

import { setupConsoleToThrow } from './packages/cozy-client/src/__tests__/console'

setupConsoleToThrow()

global.fetch = fetch
