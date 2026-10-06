import Polyglot from 'node-polyglot'

import enLocale from './en.json'
import frLocale from './fr.json'
import esLocale from './es.json'
import deLocale from './de.json'
import itLocale from './it.json'

const locales = {
  en: enLocale,
  fr: frLocale,
  es: esLocale,
  de: deLocale,
  it: itLocale
}

const polyglots = {}
const langs = ['fr', 'en', 'es', 'de', 'it']
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
