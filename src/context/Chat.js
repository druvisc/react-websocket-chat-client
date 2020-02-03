import React from 'react'

// TODO: Use only as a reducer and create a global store?
// TODO: Create a webSocketReducer and chatMiddleware
// so the websocket could be re-used for different parts of the application?

export const SOCKET = {
  CONNECT: 'CONNECT',
  DISCONNECT: 'DISCONNECT',
  SEND: 'SEND',
  OPEN: 'OPEN',
  ERROR: 'ERROR',
  CLOSE: 'CLOSE',
  MESSAGE: 'MESSAGE',
}

export const SOCKET_READY_STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}

export const MESSAGE_TYPE = {
  ERROR: 'ERROR',
  MESSAGE: 'MESSAGE',
}

export const ERROR = {
  INVALID_ENCODING: 'INVALID_ENCODING',
  INVALID_JSON: 'INVALID_JSON',
  NO_TYPE: 'NO_TYPE',
  NO_PAYLOAD: 'NO_PAYLOAD',
  NO_CONTENT: 'NO_CONTENT',
  INVALID_CONTENT: 'INVALID_CONTENT',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
}

export const MESSAGE = {
  USERNAME_OK: 'USERNAME_OK',
  USER_CONNECTED: 'USER_CONNECTED',
  USER_INACTIVE: 'USER_INACTIVE',
  USER_DISCONNECTED: 'USER_DISCONNECTED',
  USERS: 'USERS',
  USER_MESSAGE: 'USER_MESSAGE',
  SERVER_MESSAGE: 'SERVER_MESSAGE',
}

const defaultValue = {
  readyState: SOCKET_READY_STATE.CLOSED,
  error: null,
  close: null,
  username: '',
  users: [],
  messages: [],
}

const ChatStateContext = React.createContext(defaultValue)
const ChatDispatchContext = React.createContext()

const chatReducer = (state, action) => {
  switch (action.type) {
    // TODO: Move up socket or place in state.
    case SOCKET.CONNECT:
      const scheme = document.location.protocol === 'https:' ? 'wss' : 'ws'
      const port = 8080
      const url = `${scheme}://${document.location.hostname}:${port}`
      const socket = new WebSocket(url)

      socket = new WebSocket(action.payload.url)
      // Would be more suitable as middleware
      socket.onopen = () => chatReducer(state, { type: SOCKET.OPEN })
      socket.onerror = event => chatReducer(state, { type: SOCKET.ERROR, payload: event })
      socket.onclose = event => chatReducer(state, { type: SOCKET.CLOSE, payload: event })
      socket.onmessage = event => chatReducer(state, { type: SOCKET.MESSAGE, payload: event })
      return { ...state, readyState: socket.readyState }

    case SOCKET.DISCONNECT:
      socket.close()
      return state

    // TODO: Seperate as a thunk for better error handling?
    case SOCKET.SEND:
      try {
        const message = JSON.stringify(action.payload)
        if (socket.readyState !== SOCKET_READY_STATE.OPEN) {
          throw new Error(`Socket is ${Object.keys(SOCKET_STATE)[socket.readyState]}. Can't send message.`)
        }
        socket.send(message)
      } catch (error) {
        return state
      }

    case SOCKET.OPEN: return {
      ...state,
      readyState: socket.readyState,
    }

    case SOCKET.ERROR: return {
      ...state,
      readyState: socket.readyState,
      error: action.payload.event,
    }

    case SOCKET.CLOSE: return {
      ...state,
      readyState: socket.readyState,
      close: {
        code: action.payload.event.code,
        reason: action.payload.event.reason,
        wasClean: action.payload.event.wasClean,
      }
    }

    case SOCKET.MESSAGE:
      try {
        const data = JSON.parse(action.payload.data)
        switch (data.type) {
          case MESSAGE_TYPE.ERROR: return { ...state, error: data.payload }
          case MESSAGE_TYPE.MESSAGE: return messageReducer(state, data.payload)
        }
      } catch (error) {
        return state
      }
  }
}

function messageReducer(state, message) {
  switch (message.type) {
    case MESSAGE.USERNAME: return { ...state, username: message.payload.username }
    case MESSAGE.USER_CONNECTED:
    case MESSAGE.USER_INACTIVE:
    case MESSAGE.USER_DISCONNECTED: return { ...state, users: message.payload.users, messages: [...state.messages, message.payload.message] }
    case MESSAGE.USER_MESSAGE: return { ...state, messages: [...state.messages, message.payload.message] }
  }
}

function ChatProvider({ children }) {
  console.log('<ChatProvider />')
  const [state, dispatch] = React.useReducer(chatReducer, defaultValue)

  return (
    <ChatStateContext.Provider value={state}>
      <ChatDispatchContext.Provider value={dispatch}>
        {children}
      </ChatDispatchContext.Provider>
    </ChatStateContext.Provider>
  )
}

function useChatStateContext() {
  const context = React.useContext(ChatStateContext)
  if (context === undefined) {
    throw new Error('useChatStateContext must be used within a ChatProvider')
  }
  return context
}

function useChatDispatchContext() {
  const context = React.useContext(ChatDispatchContext)
  if (context === undefined) {
    throw new Error('useChatDispatchContext must be used within a ChatProvider')
  }
  return context
}

const useChatContext = () => [
  useChatStateContext(),
  useChatDispatchContext()
]

export { ChatProvider, useChatContext, useChatStateContext, useChatDispatchContext }


// socket.onopen = () => {
//   chatReducer(state, { type: SOCKET.OPEN })
//   chatReducer(state, { type: SOCKET.SEND, payload: { username: state.username } })
// }

// const aMessage = {
//   type: MESSAGE_TYPE.MESSAGE,
//   payload: {
//     type: MESSAGE.USER_CONNECTED,
//     payload: {
//       users: [1, 2, 3, 4, 5, 6],
//       message: {
//         id: 1,
//         date: '11/11/2011',
//         message: 'This is the message content.',
//       }
//     }
//   }
// }

// const anError = {
//   type: MESSAGE_TYPE.ERROR,
//   payload: {
//     type: ERROR.USERNAME_TAKEN,
//     payload: {
//       error: {
//         message: 'This is the error content.',
//       }
//     }
//   }
// }