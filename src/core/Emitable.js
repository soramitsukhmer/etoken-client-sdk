import Bus from '@condenast/quick-bus'

/**
 *
 */
export default class Emitable {
  constructor() {
    this._listener = new Bus()
  }

  /**
   * @param {string} topic
   * @param {any} payload
   */
  emit(topic, payload) {
    return this._listener.emit(topic, payload)
  }

  /**
   * @param {string} topic
   * @param {any} payload
   */
  publish(topic, payload) {
    return this._listener.publish(topic, payload)
  }

  /**
   * @param {string} topic
   * @param {Function} callback
   */
  on(topic, callback) {
    return this._listener.on(topic, callback)
  }

  /**
   * @param {string} topic
   * @param {Function} callback
   */
  subscribe(topic, callback) {
    return this._listener.subscribe(topic, callback)
  }
}
