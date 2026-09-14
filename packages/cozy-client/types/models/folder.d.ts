export namespace MAGIC_FOLDERS {
    const ADMINISTRATIVE: string;
    const PHOTOS: string;
    const PHOTOS_BACKUP: string;
    const PHOTOS_UPLOAD: string;
    const NOTES: string;
    const MAIL: string;
    const HOME: string;
    const PAPERS: string;
    const COACH_CO2: string;
}
export function ensureMagicFolder(client: CozyClient, id: string, path: string): Promise<import("../types").IOCozyFolder>;
export function createFolderWithReference(client: CozyClient, path: string, document: import("../types").CozyClientDocument): Promise<import("../types").IOCozyFolder>;
export function getReferencedFolder(client: CozyClient, document: import("../types").CozyClientDocument): Promise<import("../types").IOCozyFolder>;
import CozyClient from "../CozyClient";
