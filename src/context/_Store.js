import React, { createContext, useReducer, useContext } from 'react'

const defaultValue = { username: null }
const StoreStateContext = createContext(defaultValue)
const StoreDispatchContext = createContext()

const storeReducer = (state, newState) => ({ ...state, ...newState })

function StoreProvider({ children }) {
  console.log('<StoreProvider />')
  const [state, dispatch] = useReducer(storeReducer, defaultValue)

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
