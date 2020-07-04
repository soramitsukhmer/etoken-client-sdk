export default class Emittable {
  /**
   * Create a new instance of Emitable
   */
  constructor() {
    /**
     * @type {Bus}
     */
    this._listener;
  }

  /**
   * Set Listener
   * @param {Bus} listener
   */
  setListener(listener) {
    this._listener = listener
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

/**
 * @typedef Bus
 * @property {Function} emit
 * @property {Function} publish
 * @property {Function} on
 * @property {Function} subscribe
 */
