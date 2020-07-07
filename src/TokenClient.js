import Emittable from './core/Emittable'
import TokenEvent from './core/TokenEvent'

const PRIVATE_FIELDS = Symbol('private')

export default class TokenClient extends Emittable {
  constructor(
    endpoint = 'ws://localhost:44331/token',
    options = { retry: 5 }
  ) {
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
