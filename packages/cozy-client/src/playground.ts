import React from 'react'

import useClient from './hooks/useClient'

type TriggerDoctype = 'io.cozy.triggers'
type FileDoctype = 'io.cozy.files'
type Doctype = TriggerDoctype|FileDoctype

type Trigger = {
  message: object
};
type File = {
  name: string
};
type Document = Trigger|File|object;

type QResult<T extends Document> = {
  data: Array<T>
}
interface QDefinition<T> {
  doctype: T;
}

type DoctypeOf<T> = T extends { doctype: Doctype} ? T["doctype"] : never;
type Doctype2Document = {
  'io.cozy.triggers': Trigger,
  'io.cozy.files': File,
  Doctype: Document
}
type DocumentType<T extends Doctype> = Doctype2Document[T]

export const Q = <T>(doctype: T): QDefinition<T> => {
  if (typeof doctype !== 'string') {
    throw new Error("must provide doctype")
  }

  const d = doctype
  return {
    doctype: d
  }
} 

export const useQuery = <T>(qDef: T): QResult<DocumentType<DoctypeOf<T>>> => {
  const client = useClient()
  const qs = client.getQueryFromState('1')
  const Q = typeof qDef

  const data = qs.data
  return { data }
}

const FILE_DOCTYPE: FileDoctype = 'io.cozy.files'
const TRIGGER_DOCTYPE: TriggerDoctype = 'io.cozy.triggers'

const test =() => {
  const qdef = Q(FILE_DOCTYPE)
  const result = useQuery(qdef)
  const first = result.data[0]
  return first
}


