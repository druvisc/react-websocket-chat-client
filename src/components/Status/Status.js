import React from 'react'
import { useStoreStateContext } from '../../context/Store'
import { SOCKET_READY_STATE, CLOSE_CODE, } from '../../reducers/chatReducer'
import styles from './Status.module.sass'

const CloseKeys = Object.keys(CLOSE_CODE)
const CloseCodes = Object.values(CLOSE_CODE)

const Status = () => {
  const { state, chat } = useStoreStateContext()
  // const isConnecting = chat.readyState === SOCKET_READY_STATE.CONNECTING

  const getCloseReason = code => {
    const index = CloseCodes.indexOf(code)
    return index === -1 ? 'Unnknown reason.' : CloseKeys[index]
  }

  const Close = ({ close }) => {
    if (!close || close.code === CLOSE_CODE.NORMAL_CLOSURE) return null
    return <div className={styles.status__close}>Close: {close.code} - {close.reason || getCloseReason(close.code)}</div>
  }

  const Error = ({ error }) => error && <div className={styles.status__error}>{error.message || 'Error: Something went wrong.'}</div>
  // const Connecting = ({ isConnecting }) => isConnecting && <div className={styles.status__connecting}>Connecting to the server.</div>

  const Message = () =>
    state.error ? <Error error={state.error} /> :
      chat.error ? <Error error={chat.error} /> :
        chat.close ? <Close close={chat.close} /> :
          // isConnecting ? <Connecting isConnecting={isConnecting} /> :
          null

  return (
    <div className={styles.status}>
      {Message()}
    </div >
  )
}

export default Status
