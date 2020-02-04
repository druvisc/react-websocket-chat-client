const location = (window && window.location) || {}

const protocol = location.protocol && location.protocol.split(':')[0]
const host = location.host

const wsScheme = protocol === 'https' ? 'wss' : 'ws'
const wsHostname = location.hostname
const wsPort = 8080

const CONFIG = {
  PROTOCOL: process.env.REACT_APP_PROTOCOL || protocol,
  HOST: process.env.REACT_APP_HOST || host,

  WS_SCHEME: process.env.REACT_APP_WS_SCHEME || wsScheme,
  WS_HOSTNAME: process.env.REACT_APP_WS_HOSTNAME || wsHostname,
  WS_PORT: process.env.REACT_APP_WS_PORT || wsPort
}
if (CONFIG.HOST[CONFIG.HOST.length - 1] === '/')
  CONFIG.HOST = CONFIG.HOST.slice(0, -1)

CONFIG.BASE_URL = `${CONFIG.PROTOCOL}://${CONFIG.HOST}`

export default CONFIG
