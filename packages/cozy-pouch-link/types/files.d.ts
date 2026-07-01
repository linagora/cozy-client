export const TYPE_DIRECTORY: "directory";
export const TYPE_FILE: "file";
export function queryFileById(client: object, id: string, driveId?: string): Promise<any>;
