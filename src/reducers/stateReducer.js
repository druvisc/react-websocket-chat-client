import { frozenObject } from '../utils'
import { STATE } from './types'

export const initialState = frozenObject({
  error: null,
  username: null
})

export default function stateReducer(state = initialState, action) {
  switch (action.type) {
    case STATE.SET_ERROR:
      return { ...initialState, error: action.payload.error }
    case STATE.SET_USERNAME:
      return { ...initialState, username: action.payload.username }
    default:
      return state
  }
}
