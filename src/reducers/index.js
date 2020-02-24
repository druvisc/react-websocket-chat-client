import { frozenObject } from '../utils'
import stateReducer, { initialState as stateInitial } from './stateReducer'
import chatReducer, { initialState as chatInitial } from './chatReducer'

export const initialState = frozenObject({
  state: stateInitial,
  chat: chatInitial
})

export default function rootReducer(store = initialState, action) {
  const { state, chat } = store

  return {
    state: stateReducer(state, action),
    chat: chatReducer(chat, action)
  }
}
