import React, { createContext, useReducer, useContext } from 'react'
import rootReducer, { initialState } from '../reducers'
import { websocketMiddleware } from '../reducers/chatReducer'
import useEnhancedReducer from '../hooks/useEnhancedReducer'

const StoreStateContext = createContext(initialState)
const StoreDispatchContext = createContext()

const withThunks = (dispatch, state) => action =>
  typeof action === 'function' ? action(dispatch, state) : dispatch(action)

// useEnhancedMiddleware is busted, atleast with multiple reducers.
// const [state, _dispatch] = useReducer(rootReducer, initialState)
// const dispatch = React.useCallback(withThunks(_dispatch, state), [])

function StoreProvider({ children }) {
  const [state, _dispatch] = useReducer(rootReducer, initialState)
  const dispatch = React.useCallback(withThunks(_dispatch, state), [])

  // const [state, dispatch] = useEnhancedReducer(rootReducer, initialState, [websocketMiddleware])

  return (
    <StoreStateContext.Provider value={state}>
      <StoreDispatchContext.Provider value={dispatch}>
        {children}
      </StoreDispatchContext.Provider>
    </StoreStateContext.Provider>
  )
}

function useStoreStateContext() {
  const context = useContext(StoreStateContext)
  if (context === undefined) {
    throw new Error('useStoreStateContext must be used within a StoreProvider')
  }
  return context
}

function useStoreDispatchContext() {
  const context = useContext(StoreDispatchContext)
  if (context === undefined) {
    throw new Error('useStoreDispatchContext must be used within a StoreProvider')
  }
  return context
}

const useStoreContext = () => [
  useStoreStateContext(),
  useStoreDispatchContext()
]

export { StoreProvider, useStoreContext, useStoreStateContext, useStoreDispatchContext }
