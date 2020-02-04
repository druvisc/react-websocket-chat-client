import CONFIG from '../config'
import { frozenObject } from '../utils'
import { SOCKET_READY_STATE, CLOSE_CODE } from '../const'
import { SOCKET, MESSAGE_TYPE, MESSAGE, STATE } from './types'

export const initialState = frozenObject({
  readyState: SOCKET_READY_STATE.CLOSED,
  error: null,
  close: null,
  users: [],
  messages: []
})

let ChatSocket
export const connectAction = ({ username }) => (dispatch, state) => {
  const url = `${CONFIG.WS_SCHEME}://${CONFIG.WS_HOSTNAME}:${CONFIG.WS_PORT}`

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
          // Not in use, all messages are delivered through MESSAGE_TYPE.MESSAGE.
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
