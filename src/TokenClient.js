import Bus from '@condenast/quick-bus'
import Emittable from './core/Emittable'
import TokenEvent from './core/TokenEvent'

const PRIVATE_FIELDS = Symbol('private')

export default class TokenClient extends Emittable {
  constructor() {
    super()

    this[PRIVATE_FIELDS] = {
      is: {
        ready: false
      }
    }

    this._bootstrap()
  }

  /**
   * Bootstrap the token client
   */
  _bootstrap() {
    const listener = new Bus()

    this.setListener(listener)
    this.emitReadyEvent()
  }

  /**
   * Emit Ready Event
   */
  emitReadyEvent() {
    if (this[PRIVATE_FIELDS].is.ready) return
    setTimeout(() => this.emit(TokenEvent.READY_EVENT, this));
    this[PRIVATE_FIELDS].is.ready = true
  }
}
