export default useFetchShortcut;
/**
 * Fetch a shortcut and the icon to display for it.
 *
 * @param {import('../CozyClient').default} client - A CozyClient instance
 * @param {string} id - The shortcut file id
 * @param {string} [driveId] - Id of the shared drive the shortcut belongs to
 */
declare function useFetchShortcut(client: import('../CozyClient').default, id: string, driveId?: string): {
    shortcutInfos: any;
    shortcutImg: any;
    fetchStatus: string;
};
