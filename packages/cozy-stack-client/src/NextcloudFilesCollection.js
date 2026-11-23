import DocumentCollection from './DocumentCollection'
import { forceDownload, joinPath, encodePath } from './utils'
import { FetchError } from './errors'
import { normalizeDoctypeJsonApi } from './normalize'

const NEXTCLOUD_FILES_DOCTYPE = 'io.cozy.remote.nextcloud.files'

const normalizeNextcloudFileJsonApi = normalizeDoctypeJsonApi(
  NEXTCLOUD_FILES_DOCTYPE
)

const normalizeNextcloudFile =
  (sourceAccount, parentPath, { fromTrash = false } = {}) =>
  file => {
    const normalizedDoc = normalizeNextcloudFileJsonApi(file)

    return {
      ...normalizedDoc,
      parentPath,
      path: fromTrash
        ? normalizedDoc.path
        : joinPath(parentPath, normalizedDoc.name),
      cozyMetadata: {
        ...normalizedDoc.cozyMetadata,
        sourceAccount
      }
    }
  }

class NextcloudFilesCollection extends DocumentCollection {
  constructor(stackClient) {
    super(NEXTCLOUD_FILES_DOCTYPE, stackClient)
  }

  async find(selector) {
    if (selector['cozyMetadata.sourceAccount'] && selector.parentPath) {
      const resp = await this.stackClient.fetchJSON(
        'GET',
        `/remote/nextcloud/${
          selector['cozyMetadata.sourceAccount']
        }${encodePath(selector.parentPath)}`
      )

      return {
        data: resp.data.map(
          normalizeNextcloudFile(
            selector['cozyMetadata.sourceAccount'],
            selector.parentPath,
            { fromTrash: selector.trashed }
          )
        )
      }
    }
    throw new Error('Not implemented')
  }

  /**
   *  Move a file to the trash
   *
   * @param {object} file - The `io.cozy.remote.nextcloud.files` file to move to the trash
   * @returns {Promise<object>}
   * @throws {FetchError}
   */
  async destroy(file) {
    const resp = await this.stackClient.fetch(
      'DELETE',
      `/remote/nextcloud/${file.cozyMetadata.sourceAccount}${encodePath(
        file.path
      )}`
    )
    if (resp.status === 204) {
      return resp
    }
    throw new FetchError(resp, resp.json())
  }

  /**
   * Move to the trash multiple files
   *
   * @param {object[]} files - `io.cozy.remote.nextcloud.files` files to move to the trash
   * @returns {Promise<any>}
   * @throws {FetchError}
   */
  async destroyAll(files) {
    for (const file of files) {
      await this.destroy(file)
    }
  }

  /**
   * Download a file from a Nextcloud server
   *
   * @param {object} file - The `io.cozy.remote.nextcloud.files` file to download
   */
  async download(file) {
    const res = await this.stackClient.fetch(
      'GET',
      `/remote/nextcloud/${file.cozyMetadata.sourceAccount}${encodePath(
        file.path
      )}?Dl=1`
    )
    const blob = await res.blob()
    const href = URL.createObjectURL(blob)
    const filename = file.path.split('/').pop()
    forceDownload(href, filename)
  }

  /**
   * Move a file inside a Nextcloud server
   *
   * @param {object} file - The `io.cozy.remote.nextcloud.files` file to move
   * @param {object} to - The `io.cozy.remote.nextcloud.files` folder to move the file to
   */
  async move(file, to) {
    const newPath = joinPath(to.path, file.name)
    const resp = await this.stackClient.fetch(
      'POST',
      `/remote/nextcloud/${file.cozyMetadata.sourceAccount}/move${encodePath(
        file.path
      )}?To=${encodePath(newPath)}`
    )
    if (resp.status === 204) {
      return resp
    }
    throw new FetchError(resp, resp.json())
  }

  /**
   * Move a file from a Nextcloud server to a Cozy
   *
   * @param {object} file - The `io.cozy.remote.nextcloud.files` file to move
   * @param {object} to - The `io.cozy.files` folder to move the file to
   * @param {object} [options] - Options
   * @param {boolean} [options.copy] - Whether to copy the file instead of moving it
   * @param {boolean} [options.FailOnConflict] - Whether to fail with 409 on conflict instead of auto-renaming the file
   */
  async moveToCozy(file, to, { copy = false, FailOnConflict = false } = {}) {
    const resp = await this.stackClient.fetch(
      'POST',
      `/remote/nextcloud/${
        file.cozyMetadata.sourceAccount
      }/downstream${encodePath(file.path)}?To=${to._id}${
        copy ? '&Copy=true' : ''
      }${FailOnConflict ? '&FailOnConflict=true' : ''}`
    )
    if (resp.status === 201) {
      return resp
    }
    throw new FetchError(resp, resp.json())
  }

  /**
   * Move a file from a Cozy to a Nextcloud server
   *
   * @param {object} file - The `io.cozy.remote.nextcloud.files` folder to move the file to
   * @param {object} from - The `io.cozy.files` file to move
   * @param {object} [options] - Options
   * @param {boolean} [options.copy] - Whether to copy the file instead of moving it
   * @throws {FetchError}
   */
  async moveFromCozy(file, from, { copy = false } = {}) {
    const newPath = joinPath(file.path, from.name)
    const resp = await this.stackClient.fetch(
      'POST',
      `/remote/nextcloud/${
        file.cozyMetadata.sourceAccount
      }/upstream${encodePath(newPath)}?From=${from._id}${
        copy ? '&Copy=true' : ''
      }`
    )
    if (resp.status === 204) {
      return resp
    }
    throw new FetchError(resp, resp.json())
  }

  /**
   * Restores a file from the Nextcloud server.
   *
   * @param {Object} file - The file to restore.
   * @returns {Promise<Response>} - A promise that resolves to the response from the server.
   * @throws {FetchError} - If the server response is not successful.
   */
  async restore(file) {
    const resp = await this.stackClient.fetch(
      'POST',
      `/remote/nextcloud/${file.cozyMetadata.sourceAccount}/restore${encodePath(
        file.path
      )}`
    )
    if (resp.status === 204) {
      return resp
    }
    throw new FetchError(resp, resp.json())
  }

  /**
   * Empties the trash for the specified source account.
   *
   * @param {string} sourceAccount - The source account to empty the trash for.
   * @returns {Promise<Response>} - A promise that resolves to the response from the server.
   * @throws {FetchError} - If the server returns an error response.
   */
  async emptyTrash(sourceAccount) {
    const resp = await this.stackClient.fetch(
      'DELETE',
      `/remote/nextcloud/${sourceAccount}/trash`
    )
    if (resp.status === 204) {
      return resp
    }
    throw new FetchError(resp, resp.json())
  }

  /**
   * Deletes a file permanently from the Nextcloud server.
   *
   * @param {Object} file - The file object to be deleted.
   * @returns {Promise<Response>} - A promise that resolves to the response from the server.
   * @throws {FetchError} - If the server returns an error response.
   */
  async deletePermanently(file) {
    const resp = await this.stackClient.fetch(
      'DELETE',
      `/remote/nextcloud/${file.cozyMetadata.sourceAccount}${encodePath(
        file.path
      )}`
    )
    if (resp.status === 204) {
      return resp
    }
    throw new FetchError(resp, resp.json())
  }

  /**
   * Copy a file or folder to another path on the same Nextcloud server
   *
   * @param {object} file - The `io.cozy.remote.nextcloud.files` file to copy
   * @param {object} to - Whether to copy the file
   */
  async copy(file, to) {
    return await this.stackClient.fetchJSON(
      'POST',
      `/remote/nextcloud/${file.cozyMetadata.sourceAccount}/copy/${file.path}${
        to ? `?Path=${to.path}/${file.name}` : ''
      }`
    )
  }
}

export { NextcloudFilesCollection, NEXTCLOUD_FILES_DOCTYPE }
