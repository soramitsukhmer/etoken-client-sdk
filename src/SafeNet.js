import retry from 'async-retry'
import sha256 from 'crypto-js/sha256'

import { createClientOption, createSocket } from './utils'

import Emittable from './core/Emittable'
import TokenEvent from './core/TokenEvent'

const PRIVATE_FIELDS = Symbol('private')

export default class SafeNet extends Emittable {
  /**
   * Create a new SafeNet instance
   * @param {string} endpoint
   * @param {any} options
   */
  constructor(
    endpoint = 'ws://localhost:44331/token',
    options = { retry: 5 }
  ) {
    super()
    this[PRIVATE_FIELDS] = createClientOption(endpoint, options)
    this._bootstrap()
  }

  /**
   * Request eToken Prompt
   * @param {string} scheme URL Scheme
   * @param {string} target Open Target
   */
  request(scheme = 'token', target = '_self') {
    open(`${scheme}://`, target)
  }

  /**
   * Sign data using eToken
   * @param {any} data
   */
  sign(data) {
    return new Promise(async (resolve, reject) => {
      try {
        this._validateData(data)

        /**
         * @type {WebSocket}
         */
        const ws = await this._connect()

        ws.addEventListener('message', ({ data }) => {
          resolve(data)
          this._emitSignEvent(data)
        })

        ws.send(data)
      } catch (error) {
        reject(error)
      } finally {
        this._resetRetry()
      }
    })
  }

  /**
   * Terminate the connection
   * @param {any} error
   */
  terminate(error = null) {
    const options = this[PRIVATE_FIELDS]

    this._emitTerminateEvent()

    if (options.socket) {
      options.socket.close()
      return
    }

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
    this._emitReadyEvent(this)
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
        this._emitConnectEvent(ws)

        ws.addEventListener('close', () => {
          this._setSocket(null)
          this._terminated()
        })

        return ws
      } catch (error) {
        if (options.retry.count >= options.retry.limit) {
          this.terminate(new Error('Failed to communicate with eToken device.'))
          return
        }

        throw error
      }
    }, {
      retry: options.retry.limit,
      onRetry: () => {
        this._emitRetryEvent(options.terminator.resolver)
      }
    })

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
   * @param {any} event
   */
  _emitReadyEvent(event) {
    if (this[PRIVATE_FIELDS].is.ready) return
    setTimeout(() => this.emit(TokenEvent.READY_EVENT, event));
    this[PRIVATE_FIELDS].is.ready = true
  }

  /**
   * Emit Sign Event
   * @private
   * @param {any} event
   */
  _emitSignEvent(event) {
    this.emit(TokenEvent.SIGN_EVENT, event)
  }

  /**
   * Emit Connect Event
   * @private
   * @param {any} event
   */
  _emitConnectEvent(event) {
    this.emit(TokenEvent.CONNECT_EVENT, event)
  }

  /**
   * Emit Retry Event
   * @private
   * @param {any} event
   */
  _emitRetryEvent(event) {
    this.emit(TokenEvent.RETRY_EVENT, event)
  }

  /**
   * Emit Terminate Event
   * @private
   */
  _emitTerminateEvent() {
    this.emit(TokenEvent.TERMINATE_EVENT, null)
  }

  /**
   * Create a SHA256 Hash
   * @param {any} data
   */
  static hash(data) {
    return sha256(data).toString()
  }
}
