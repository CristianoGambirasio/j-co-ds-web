const id = Math.floor(Math.random() * 10)
let WS = new WebSocket('ws://' + window.location.hostname + ':3000', id)

export function connect () {
  WS = new WebSocket('ws://' + window.location.hostname + ':3000', id)
}
export function returnWS () {
  return WS
}
