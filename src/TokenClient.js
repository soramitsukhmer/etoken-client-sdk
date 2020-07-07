import retry from 'async-retry'

import { createSocket } from './utils'

import Emittable from './core/Emittable'
import TokenEvent from './core/TokenEvent'

const PRIVATE_FIELDS = Symbol('private')

export default class TokenClient extends Emittable {
  constructor(
    endpoint = 'ws://localhost:44331/token',
    options = { retry: 5 }
  ) {
    super()

    /**
     * @type {TokenClientOptions}
     */
    this[PRIVATE_FIELDS] = {
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

    this._bootstrap()
  }

  /**
   * Sign data using eToken
   * @param {any} data
   */
  sign(data) {
    return new Promise(async (resolve, reject) => {
      try {
        this._validateData(data)

        open('token://', '_self')

        /**
         * @type {WebSocket}
         */
        const ws = await this._connect()

        ws.addEventListener('message', e => resolve(e.data))

        ws.addEventListener('close', e => {
          this._setSocket(null)
          this._terminated()
        })

        ws.send(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Terminate the connection
   * @param {any} error
   */
  terminate(error = null) {
    const options = this[PRIVATE_FIELDS]

    if (!error) error = new Error('Request rejected from user.')

    if (typeof options.terminator.resolver === 'function') {
      options.terminator.resolver(error)
      this._setTerminatorResolver(null)
    }

    this._resetRetry()
    this._terminated()
  }

  /**
   * Bootstrap the token client
   * @private
   */
  _bootstrap() {
    this._emitReadyEvent()
  }

  /**
   * Create a connection to WebSocket
   * @private
   */
  async _connect() {
    const options = this[PRIVATE_FIELDS]

    this._terminated(false)

    const retryResolver = await retry(async bail => {
      try {
        if (options.terminator.terminated) return
        this._incrementRetry()
        this._setTerminatorResolver(bail)

        const ws = await createSocket(options.endpoint)
        this._setSocket(ws)

        return ws
      } catch (error) {
        if (options.retry.count >= options.retry.limit) {
          this.terminate(new Error('Failed to communicate with eToken device.'))
          return
        }

        throw error
      }
    }, { retry: options.retry.limit })

    return retryResolver
  }

  /**
   * Set Socket
   * @private
   * @param {WebSocket?} socket
   */
  _setSocket(socket) {
    this[PRIVATE_FIELDS].socket = socket
  }

  /**
   * Set terminator resolver
   * @private
   * @param {Function?} resolver
   */
  _setTerminatorResolver(resolver) {
    this[PRIVATE_FIELDS].terminator.resolver = resolver
  }

  /**
   * Validate Data
   * @private
   * @param {any} data
   */
  _validateData(data) {
    if (typeof data !== 'string') {
      this._throwInvalidDataException()
    }
  }

  /**
   * Increment retries count
   * @private
   */
  _incrementRetry() {
    this[PRIVATE_FIELDS].retry.count++
  }

  /**
   * Reset retries count
   * @private
   */
  _resetRetry() {
    this[PRIVATE_FIELDS].retry.count = 0
  }

  /**
   * Set termination status
   * @private
   * @param {Boolean} status
   */
  _terminated(status = true) {
    this[PRIVATE_FIELDS].terminator.terminated = status
  }

  /**
   * @throws Invalid Data Exception
   * @private
   */
  _throwInvalidDataException() {
    throw new Error('Data must be a valid string for eToken to sign.')
  }

  /**
   * Emit Ready Event
   * @private
   */
  _emitReadyEvent() {
    if (this[PRIVATE_FIELDS].is.ready) return
    setTimeout(() => this.emit(TokenEvent.READY_EVENT, this));
    this[PRIVATE_FIELDS].is.ready = true
  }
}

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
