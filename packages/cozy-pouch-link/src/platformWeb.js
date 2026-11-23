import PouchDB from 'pouchdb-browser'

import { LOCALSTORAGE_STORAGE_KEYS } from './localStorage'

const events = {
  addEventListener: (eventName, handler) => {
    document.addEventListener(eventName, handler)
  },
  removeEventListener: (eventName, handler) => {
    document.removeEventListener(eventName, handler)
  }
}

const getItem = async key => {
  return window.localStorage.getItem(key)
}
const setItem = async (key, value) => {
  return window.localStorage.setItem(key, value)
}
const removeItem = async key => {
  return window.localStorage.removeItem(key)
}
const destroy = async () => {
  for (const key of Object.values(LOCALSTORAGE_STORAGE_KEYS)) {
    await removeItem(key)
  }
}

const storage = {
  getItem: getItem,
  setItem: setItem,
  removeItem: removeItem,
  destroy: destroy
}

const isOnline = async () => {
  return window.navigator.onLine
}

export const platformWeb = {
  storage,
  events,
  pouchAdapter: PouchDB,
  isOnline
}
