import * as trigger from './trigger'
import * as instance from './instance'
import * as applications from './applications'
import * as file from './file'
import * as folder from './folder'
import * as konnectorFolder from './konnectorFolder'
import * as account from './account'
import * as note from './note'
import * as permission from './permission'
import * as utils from './utils'
import * as contact from './contact'
import * as document from './document'
import * as timeseries from './timeseries'
import * as sharing from './sharing'
import * as dacc from './dacc'
import * as paper from './paper'
import * as user from './user'
import * as geo from './geo'
import * as doctypes from './doctypes'
import * as ai from './ai'
import * as assistant from './assistant'

// For backward compatibility before 9.0.0
const triggers = trigger
const accounts = account

export {
  triggers,
  trigger,
  instance,
  applications,
  file,
  folder,
  konnectorFolder,
  note,
  account,
  accounts,
  permission,
  utils,
  contact,
  document,
  timeseries,
  sharing,
  dacc,
  paper,
  user,
  geo,
  doctypes,
  ai,
  assistant
}
