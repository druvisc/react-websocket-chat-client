import { frozenObject } from '../utils'

export const STATE = {
  SET_ERROR: 'SET_ERROR',
  SET_USERNAME: 'SET_USERNAME'
}

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
  }
  return state
}
