import { frozenObject } from '../utils'
import { STATE } from './stateReducer'

export const SOCKET = {
  CONNECT: 'CONNECT',
  DISCONNECT: 'DISCONNECT',
  OPEN: 'OPEN',
  ERROR: 'ERROR',
  CLOSE: 'CLOSE',
  MESSAGE: 'MESSAGE'
}

export const SOCKET_READY_STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}

export const CLOSE_CODE = {
  NORMAL_CLOSURE: 1000,
  GOING_AWAY: 1001,
  PRTOCOL_ERROR: 1002,
  UNSUPPORTED_DATA: 1003,
  NO_STATUS_RECEIVED: 1005,
  ABNORMAL_CLOSURE: 1006,
  INVALID_FRAME: 1007,
  POLICY_VIOLATION: 1008,
  MESSAGE_TOO_BIG: 1009,
  MISSING_EXTENSION: 1010,
  INTERNAL_ERROR: 1011,
  SERVICE_RESTART: 1012,
  TRY_AGAIN_LATER: 1013,
  BAD_GATEWAY: 1014,
  BAD_TLS_HANDSHAKE: 1015
}

export const MESSAGE_TYPE = {
  ERROR: 'ERROR',
  WARNING: 'WARNING',
  MESSAGE: 'MESSAGE'
}

export const ERROR = {
  EXCEEDS_PAYLOAD: 'EXCEEDS_PAYLOAD',
  INVALID_MESSAGE: 'INVALID_MESSAGE'
}

export const WARNING = {
  EXCEEDS_RATE_LIMIT: 'EXCEEDS_RATE_LIMIT'
}

export const MESSAGE = {
  USER_CONNECTED: 'USER_CONNECTED',
  USER_INACTIVE: 'USER_INACTIVE',
  USER_DISCONNECTED: 'USER_DISCONNECTED',
  USERS: 'USERS',
  USER_MESSAGE: 'USER_MESSAGE',
  SERVER_MESSAGE: 'SERVER_MESSAGE'
}

export const initialState = frozenObject({
  readyState: SOCKET_READY_STATE.CLOSED,
  error: null,
  close: null,
  users: [],
  messages: []
})

let ChatSocket
export const connectAction = ({ username }) => (dispatch, state) => {
  const scheme = document.location.protocol === 'https:' ? 'wss' : 'ws'
  const port = 8080
  const url = `${scheme}://${document.location.hostname}:${port}`

  if (ChatSocket) {
    ChatSocket.close(CLOSE_CODE.NORMAL_CLOSURE)
  }

  dispatch({ type: STATE.SET_USERNAME, payload: { username } })
  dispatch({ type: SOCKET.CONNECT })

  ChatSocket = new WebSocket(url)
  ChatSocket.onopen = () => dispatch({ type: SOCKET.OPEN })
  ChatSocket.onerror = event => dispatch({ type: SOCKET.ERROR, payload: event })
  ChatSocket.onclose = event => dispatch({ type: SOCKET.CLOSE, payload: event })
  ChatSocket.onmessage = event =>
    dispatch({ type: SOCKET.MESSAGE, payload: event })
}

export const disconnectAction = () => (dispatch, state) => {
  dispatch({ type: STATE.SET_USERNAME, payload: { username: '' } })
  dispatch({ type: SOCKET.DISCONNECT })
  ChatSocket.close(CLOSE_CODE.NORMAL_CLOSURE, 'User manually disconnected.')
}

export const sendMessageAction = ({ message }) => (dispatch, state) => {
  if (ChatSocket.readyState !== SOCKET_READY_STATE.OPEN) {
    throw new Error(
      `Socket is ${
        Object.keys(SOCKET)[ChatSocket.readyState]
      }. Can't send message.`
    )
  }
  ChatSocket.send(message)
}

export default function chatReducer(state = initialState, action) {
  switch (action.type) {
    case SOCKET.CONNECT:
      return { ...initialState, readyState: SOCKET_READY_STATE.CONNECTING }

    case SOCKET.DISCONNECT:
      return { ...initialState }

    case SOCKET.OPEN:
      return {
        ...state,
        readyState: ChatSocket.readyState
      }

    case SOCKET.ERROR:
      return {
        ...state,
        readyState: ChatSocket.readyState,
        error: action.payload
      }

    case SOCKET.CLOSE:
      return {
        ...state,
        readyState: ChatSocket.readyState,
        close: {
          code: action.payload.code,
          reason: action.payload.reason,
          wasClean: action.payload.wasClean
        }
      }

    case SOCKET.MESSAGE:
      try {
        const data = JSON.parse(action.payload.data)
        switch (data.type) {
          case MESSAGE_TYPE.MESSAGE:
            return messageReducer(state, data.payload)
          // Not in use, currently all messages are delivered through the MESSAGE_TYPE.MESSAGE.
          // case MESSAGE_TYPE.WARNING:
          //   return { ...state, warning: { message: data.payload.warning } }
          // case MESSAGE_TYPE.ERROR:
          //   return { ...state, error: { message: data.payload.error } }
          default:
            return state
        }
      } catch (error) {
        return state
      }

    default:
      return state
  }
}

function messageReducer(state, message) {
  switch (message.type) {
    case MESSAGE.USER_CONNECTED:
    case MESSAGE.USER_INACTIVE:
    case MESSAGE.USER_DISCONNECTED:
      return {
        ...state,
        users: message.payload.users,
        messages: [...state.messages, message.payload.message]
      }
    case MESSAGE.SERVER_MESSAGE:
    case MESSAGE.USER_MESSAGE:
    default:
      return {
        ...state,
        messages: [...state.messages, message.payload.message]
      }
  }
}
