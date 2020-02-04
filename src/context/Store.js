import React, { createContext, useReducer, useContext } from 'react'
import rootReducer, { initialState } from '../reducers'

const StoreStateContext = createContext(initialState)
const StoreDispatchContext = createContext()

const withThunks = (dispatch, state) => action =>
  typeof action === 'function' ? action(dispatch, state) : dispatch(action)

function StoreProvider({ children }) {
  const [state, _dispatch] = useReducer(rootReducer, initialState)
  const dispatch = React.useCallback(withThunks(_dispatch, state), [])

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
    throw new Error(
      'useStoreDispatchContext must be used within a StoreProvider'
    )
  }
  return context
}

const useStoreContext = () => [
  useStoreStateContext(),
  useStoreDispatchContext()
]

export {
  StoreProvider,
  useStoreContext,
  useStoreStateContext,
  useStoreDispatchContext
}
