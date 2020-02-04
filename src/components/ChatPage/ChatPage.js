import React, { useState, useRef, useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import { useStoreContext } from '../../context/Store'
import { SOCKET_READY_STATE } from '../../const'
import { MESSAGE } from '../../reducers/types'
import { sendMessageAction, disconnectAction } from '../../reducers/chatReducer'
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'
import styles from './ChatPage.module.sass'

const ChatPage = () => {
  const [store, dispatch] = useStoreContext()
  const {
    state: { username },
    chat: { close, error, readyState, users, messages }
  } = store
  const isSocketOpen =
    !close && !error && readyState === SOCKET_READY_STATE.OPEN

  if (!username || !isSocketOpen)
    return <Redirect to={{ pathname: '/', state: { from: '/chat' } }} />

  const sendMessage = message => dispatch(sendMessageAction({ message }))
  const disconnect = () => dispatch(disconnectAction())

  return (
    <div className={styles.chat}>
      <div>
        <UserList active={isSocketOpen} users={users} username={username} />
      </div>

      <div className={styles.rightContainer}>
        <MessageList messages={messages} />
        <Input
          disabled={!isSocketOpen}
          sendMessage={sendMessage}
          disconnect={disconnect}
        />
      </div>
    </div>
  )
}

const UserList = ({ active, users, username }) => (
  <ul className={`${styles.userList} ${active ? styles.active : ''}`}>
    {users.map(user => (
      <User key={user} user={user} current={user === username} />
    ))}
  </ul>
)

const User = ({ user, current }) => (
  <li className={current ? styles.userCurrent : ''}>
    <span className={styles.username}>{user}</span>{' '}
    {current ? <span>(You)</span> : null}
  </li>
)

const MessageList = ({ messages }) => {
  const bottom = useRef(null)

  const scrollToBottom = () => {
    bottom.current.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest'
    })
  }

  useEffect(scrollToBottom, [messages])

  return (
    <ol className={styles.messageList}>
      {messages.map(message => (
        <Message key={message.id} message={message} />
      ))}
      <li ref={bottom}></li>
    </ol>
  )
}

const Message = ({ message }) => {
  const date = formatDate(message.date)
  switch (message.type) {
    case MESSAGE.USER_CONNECTED:
    case MESSAGE.USER_INACTIVE:
    case MESSAGE.USER_DISCONNECTED:
      return (
        <li className={styles.statusMessage}>
          [{date}] {message.message}
        </li>
      )
    case MESSAGE.USER_MESSAGE:
      return (
        <li className={styles.userMessage}>
          [{date}] {`<`}
          {message.username}
          {`>`}: {message.message}
        </li>
      )
    case MESSAGE.SERVER_MESSAGE:
      return <li className={styles.serverMessage}>{message.message}</li>
    default:
      return <li className={styles.statusMessage}>Broken message.</li>
  }
}

const formatDate = dateStr => {
  const date = new Date(dateStr)
  return `${date.toLocaleTimeString()}`
}

const MaxMessageLength = 512
const Input = ({ disabled, sendMessage, disconnect }) => {
  const textareaEl = useRef(null)
  const [message, setMessage] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    const trimmed = message.trim()
    if (disabled || !trimmed) return

    sendMessage(trimmed)
    setMessage('')
    textareaEl.current.focus()
  }

  const handleChange = e => {
    setMessage(e.target.value)
  }

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e)
  }

  const handleDisconnect = e => {
    disconnect()
  }

  return (
    <fieldset disabled={disabled} className={styles.input}>
      <form onSubmit={handleSubmit}>
        <textarea
          autoFocus
          ref={textareaEl}
          aria-label='Message'
          name='message'
          type='text'
          placeholder='Enter a message'
          maxLength={MaxMessageLength}
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
        <button type='submit'>Send</button>
        <button onClick={handleDisconnect}>Disconnect</button>
      </form>
    </fieldset>
  )
}

export default () => (
  <ErrorBoundary>
    <ChatPage />
  </ErrorBoundary>
)
