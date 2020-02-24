import React from 'react'
import { SOCKET_READY_STATE, CLOSE_CODE } from '../../const'
import { useStoreStateContext } from '../../context/Store'
import styles from './Status.module.sass'

const CloseKeys = Object.keys(CLOSE_CODE)
const CloseValues = Object.values(CLOSE_CODE)

const getCloseReason = code => {
  const index = CloseValues.indexOf(code)
  return index === -1 ? 'Unnknown reason.' : CloseKeys[index]
}

const Status = () => {
  const { state, chat } = useStoreStateContext()
  const isConnecting = chat.readyState === SOCKET_READY_STATE.CONNECTING

  return (
    <div className={styles.status}>
      {state.error ? (
        <Error error={state.error} />
      ) : chat.error ? (
        <Error error={chat.error} />
      ) : chat.close ? (
        <Close close={chat.close} />
      ) : isConnecting ? (
        <Connecting />
      ) : null}
    </div>
  )
}

const Error = ({ error }) => (
  <div className={styles.status__error}>
    {error.message || 'Error: Something went wrong.'}
  </div>
)

const Close = ({ close }) =>
  close.code === CLOSE_CODE.NORMAL_CLOSURE ? null : (
    <div className={styles.status__close}>
      Close: {close.code} - {close.reason || getCloseReason(close.code)}
    </div>
  )

const Connecting = () => (
  <div className={styles.status__connecting}>Connecting to the server.</div>
)

export default Status
