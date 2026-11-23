import { Q } from '../queries/dsl'
import HasMany from './HasMany'

const TRIGGERS_DOCTYPE = 'io.cozy.triggers'

/**
 * Association used for konnectors to retrieve all their related triggers.
 *
 * @augments HasMany
 */
class HasManyTriggers extends HasMany {
  get data() {
    return super.data.filter(({ slug }) => slug === this.target.slug)
  }

  /**
   * In this association the query is special, we need to fetch all the triggers
   * having for the 'konnector' worker, and then filter them based on their
   * `message.konnector` attribute
   */
  static query(doc, client) {
    return Q(TRIGGERS_DOCTYPE).where({ worker: 'konnector' })
  }
}

export default HasManyTriggers
