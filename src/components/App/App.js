import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { StoreProvider } from '../../context/Store'
import LoginPage from '../LoginPage/LoginPage'
import ChatPage from '../ChatPage/ChatPage'
import Status from '../Status/Status'
import '../../styles/index.sass'

function App() {
  return (
    <StoreProvider>
      <Status />
      <BrowserRouter>
        <Switch>
          <Route exact path='/'>
            <LoginPage />
          </Route>
          <Route path='/chat'>
            <ChatPage />
          </Route>
        </Switch>
      </BrowserRouter>
    </StoreProvider>
  )
}

export default App
