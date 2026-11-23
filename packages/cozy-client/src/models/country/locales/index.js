import Polyglot from 'node-polyglot'

import deLocale from './de.json'
import enLocale from './en.json'
import esLocale from './es.json'
import frLocale from './fr.json'
import itLocale from './it.json'
import ruLocale from './ru.json'
import viLocale from './vi.json'

const locales = {
  en: enLocale,
  fr: frLocale,
  es: esLocale,
  de: deLocale,
  it: itLocale,
  ru: ruLocale,
  vi: viLocale
}

const polyglots = {}
const langs = ['fr', 'en', 'es', 'de', 'it', 'ru', 'vi']
for (const lang of langs) {
  const polyglot = new Polyglot()
  polyglot.extend(locales[lang])
  polyglots[lang] = polyglot
}

/**
 * @param {string} lang - fr, en, etc
 * @returns {{ t: Function, polyglot: object, lang: string }}
 */
export const getLocalizer = lang => {
  const polyglot = polyglots[lang] || polyglots['en']
  const t = polyglot.t.bind(polyglot)
  return { t, polyglot, lang }
}
