const location = (window && window.location) || {}

const protocol = location.protocol && location.protocol.split(':')[0]
const hostname = location.hostname
const port = location.port

const wsScheme = protocol === 'https' ? 'wss' : 'ws'

const CONFIG = {
  PROTOCOL: process.env.REACT_APP_PROTOCOL || protocol,
  HOSTNAME: process.env.REACT_APP_HOSTNAME || hostname,
  PORT: process.env.REACT_APP_PORT || port,

  WS_SCHEME: process.env.REACT_APP_WS_SCHEME || wsScheme
}
CONFIG.WS_HOSTNAME = process.env.REACT_APP_WS_HOSTNAME || CONFIG.HOSTNAME
CONFIG.WS_PORT = process.env.REACT_APP_WS_PORT || CONFIG.PORT

if (CONFIG.HOSTNAME[CONFIG.HOSTNAME.length - 1] === '/')
  CONFIG.HOSTNAME = CONFIG.HOSTNAME.slice(0, -1)

CONFIG.BASE_URL = `${CONFIG.PROTOCOL}://${CONFIG.HOSTNAME}${CONFIG.PORT &&
  ':' + CONFIG.PORT}`

export default CONFIG
