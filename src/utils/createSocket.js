/**
 * Create a new WebSocket connection
 * @param {string} endpoint
 * @param  {...any} args
 */
export function createSocket(endpoint, ...args) {
  return new Promise(function (resolve, reject) {
    const ws = new WebSocket(endpoint, ...args)

    ws.addEventListener('open', () => resolve(ws))
    ws.addEventListener('error', () => reject(new Error('Unable to connect to WebSocket server.')))
  })
}
