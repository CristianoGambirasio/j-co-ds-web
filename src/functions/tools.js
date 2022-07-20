export function toBytesInt32 (num) {
  const arr = new ArrayBuffer(4)
  const view = new DataView(arr)
  view.setUint32(0, num, false)
  return arr
}

export function toBytesCommandCode (code) {
  const byteArray = new Uint8Array(8)
  for (let i = 0; i < 4; i++) {
    byteArray[i + 4] = parseInt(code.substr(i * 2, 2), 16)
  }
  return byteArray
}
