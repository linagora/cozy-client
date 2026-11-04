declare type TriggerDoctype = 'io.cozy.triggers';
declare type FileDoctype = 'io.cozy.files';
declare type Doctype = TriggerDoctype | FileDoctype;
declare type Trigger = {
    message: object;
};
declare type File = {
    name: string;
};
declare type Document = Trigger | File | object;
declare type QResult<T extends Document> = {
    data: Array<T>;
};
interface QDefinition<T> {
    doctype: T;
}
declare type DoctypeOf<T> = T extends {
    doctype: Doctype;
} ? T["doctype"] : never;
declare type Doctype2Document = {
    'io.cozy.triggers': Trigger;
    'io.cozy.files': File;
    Doctype: Document;
};
declare type DocumentType<T extends Doctype> = Doctype2Document[T];
export declare const Q: <T>(doctype: T) => QDefinition<T>;
export declare const useQuery: <T>(qDef: T) => QResult<DocumentType<DoctypeOf<T>>>;
export {};
