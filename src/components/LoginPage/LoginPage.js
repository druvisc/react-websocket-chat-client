import React, { useReducer } from 'react'
import { Redirect } from 'react-router-dom'
import CONFIG from '../../config'
import { connectAction } from '../../reducers/chatReducer'
import { useStoreContext } from '../../context/Store'
import { SOCKET_READY_STATE } from '../../const'
import { STATE } from '../../reducers/types'
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'
import styles from './LoginPage.module.sass'

const MaxUsernameLength = 16

const LoginPage = () => {
  const [
    {
      state: { username },
      chat: { close, error, readyState }
    },
    dispatch
  ] = useStoreContext()
  const isSocketOpen =
    !close && !error && readyState === SOCKET_READY_STATE.OPEN

  if (username && isSocketOpen)
    return <Redirect to={{ pathname: '/chat', state: { from: '/' } }} />

  const onLogin = username => dispatch(connectAction({ username }))
  const onError = error =>
    dispatch({
      type: STATE.SET_ERROR,
      payload: {
        error: {
          message: error
        }
      }
    })

  return (
    <div className={styles.login}>
      <LoginForm onLogin={onLogin} onError={onError} />
    </div>
  )
}

const LoginForm = ({ onLogin, onError }) => {
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { error: null, loading: false, username: '' }
  )

  const handleSubmit = async e => {
    e.preventDefault()
    const username = state.username.trim()
    if (!username) return

    setState({ loading: true })
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/login`, {
        method: 'POST',
        body: JSON.stringify({ username })
      })
      const body = await response.json()
      if (!response.ok) return setState({ loading: false, error: body.error })
      onLogin(body.username)
    } catch (err) {
      setState({ loading: false })
      onError('Server unavailable.')
    }
  }

  const handleChange = e => {
    setState({ username: e.target.value })
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset disabled={state.loading}>
        {state.error && <div className={styles.error}>{state.error}</div>}
        <input
          className={styles.input}
          autoFocus
          aria-label='Username'
          name='username'
          type='text'
          placeholder='Username'
          maxLength={MaxUsernameLength}
          value={state.username}
          onChange={handleChange}
        />
        <div className={styles.centerText}>
          <button type='submit'>Connect</button>
        </div>
      </fieldset>
    </form>
  )
}

export default () => (
  <ErrorBoundary>
    <LoginPage />
  </ErrorBoundary>
)
