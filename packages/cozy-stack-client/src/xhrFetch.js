import memoize from 'lodash/memoize'

const headersFromString = headerString => {
  return new Headers(
    headerString
      .split('\r\n')
      .map(x => x.split(':', 2))
      .filter(x => x.length == 2)
  )
}

/**
 * Returns a `fetch()` like response but uses XHR.
 * XMLHTTPRequest provides upload progress events unlike fetch.
 *
 * @private
 * @param {string} fullpath - Route path
 * @param {object} options - Fetch options
 * @param {Function} options.onUploadProgress - Callback to receive upload progress events
 * @param {number} [options.timeout] - Time in milliseconds given to the request
 */
const fetchWithXMLHttpRequest = async (fullpath, options) => {
  const response = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    if (options.onUploadProgress && xhr.upload) {
      xhr.upload.addEventListener('progress', options.onUploadProgress, false)
    }

    xhr.onload = function() {
      if (this.readyState == 4) {
        resolve(this)
      } else {
        reject(this)
      }
    }

    xhr.onerror = function(err) {
      reject(err)
    }

    xhr.open(options.method, fullpath, true)
    xhr.withCredentials = true
    if (options.timeout) {
      xhr.timeout = options.timeout
      xhr.ontimeout = () => {
        const error = new Error('The request timed out')
        error.name = 'TimeoutError'
        reject(error)
      }
    }
    for (let [headerName, headerValue] of Object.entries(options.headers)) {
      xhr.setRequestHeader(headerName, headerValue)
    }

    xhr.send(options.body)
  })

  return {
    headers: headersFromString(response.getAllResponseHeaders()),
    ok: response.status >= 200 && response.status < 300,
    text: async () => response.responseText,
    json: async () => JSON.parse(response.responseText),
    status: response.status,
    statusText: response.statusText
  }
}

const doesXHRSupportLoadAndProgress = memoize(() => {
  const xhr = new XMLHttpRequest()
  return 'onload' in xhr && 'onprogress' in xhr
})

const shouldXMLHTTPRequestBeUsed = (method, path, options) => {
  return Boolean(options.onUploadProgress) && doesXHRSupportLoadAndProgress()
}

export { fetchWithXMLHttpRequest, shouldXMLHTTPRequestBeUsed }
