import Bus from '@condenast/quick-bus'
import Emittable from './core/Emittable'

export default class TokenClient extends Emittable {
  constructor() {
    super()

    this._bootstrap()
  }

  /**
   * Bootstrap the token client
   */
  _bootstrap() {
    const listener = new Bus()

    this.setListener(listener)
  }
}
