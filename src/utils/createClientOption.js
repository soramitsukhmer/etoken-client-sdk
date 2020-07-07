/**
 *
 * @param {string} endpoint
 * @param {ClientOptions} options
 * @returns {TokenClientOptions} TokenClientOptions
 */
export function createClientOption(endpoint, options) {
  return {
    endpoint: endpoint,
    socket: null,
    retry: {
      count: 0,
      limit: options.retry
    },
    terminator: {
      resolver: null,
      terminated: false
    },
    is: {
      ready: false
    }
  }
}

/**
 * @typedef ClientOptions
 * @property {Number} retry
 */

/**
 * @typedef TokenClientOptions
 * @property {string} endpoint
 * @property {WebSocket?} socket
 * @property {Object} retry
 * @property {Number} retry.count
 * @property {Number} retry.limit
 * @property {Object} terminator
 * @property {Function?} terminator.resolver
 * @property {Boolean} terminator.terminated
 * @property {Object} is
 * @property {Boolean} is.ready
 */
