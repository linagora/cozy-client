import { useCallback } from 'react'

import { editSettings, getQuery, normalizeSettings } from '../helpers'
import { extractKeys } from '../helpers/settings'
import { hasQueryBeenLoaded } from '../utils'
import { useMutation } from './useMutation'
import useQuery from './useQuery'

/**
 * Query the cozy-app settings corresponding to the given slug and
 * return:
 * - the values corresponding to the given `keys`
 * - the `save()` method that can be used to edit the setting's value
 * - the query that manages the state during the fetching of the setting
 * - the mutation that manages the state during the saving of the setting
 *
 * @template {string} T
 *
 * @param {string} slug - the cozy-app's slug containing the setting (special cases are: 'instance' for global settings and 'passwords' for bitwarden settings)
 * @param {T[]} keys - The name of the setting to retrieve
 * @returns {import("../types").UseSettingsReturnValue<T>}
 */
export const useSettings = (slug, keys) => {
  const query = getQuery(slug)

  const { data: settingsData, ...settingsQuery } = useQuery(
    query.definition,
    query.options
  )

  const { mutate, ...mutation } = useMutation()

  const save = useCallback(
    items => {
      const settings = normalizeSettings(settingsData)

      const newSettings = editSettings(slug, settings, items)

      return mutate(newSettings)
    },
    [mutate, settingsData, slug]
  )

  const settings = normalizeSettings(settingsData)

  const settingValue = hasQueryBeenLoaded(settingsQuery)
    ? extractKeys(settings, keys)
    : undefined

  return {
    query: settingsQuery,
    values: settingValue,
    save,
    mutation
  }
}
