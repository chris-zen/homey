import debug from 'debug'
import path from 'path'

export default function (sourcePath, ...args) {
  const fileName = path.basename(sourcePath)
  const extStart = fileName.lastIndexOf('.')
  const moduleName = extStart === -1 ? fileName : fileName.substring(0, extStart)
  return debug(`thermostat:${moduleName}${args.join(':')}`)
}
