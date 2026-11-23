import * as account from './account'
import * as ai from './ai'
import * as applications from './applications'
import * as assistant from './assistant'
import * as banner from './banner'
import * as contact from './contact'
import * as dacc from './dacc'
import * as document from './document'
import * as file from './file'
import * as instance from './instance'
import * as folder from './folder'
import * as konnectorFolder from './konnectorFolder'
import * as note from './note'
import * as paper from './paper'
import * as permission from './permission'
import * as sharing from './sharing'
import * as timeseries from './timeseries'
import * as utils from './utils'
import * as user from './user'
import * as geo from './geo'
import * as doctypes from './doctypes'
import * as trigger from './trigger'

// For backward compatibility before 9.0.0
const triggers = trigger
const accounts = account

export {
  triggers,
  banner,
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
