import * as React from "react"
import {
  ChakraProvider,
  theme,
} from "@chakra-ui/react"
import { ProjectView } from './components/ProjectView'
import { LoginPage } from './components/LoginPage'
import { Dashboard } from './components/Dashboard'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { useAuthToken } from './hooks/useAuthToken'
import { PrivateRoute } from './components/PrivateRoute'

export const App = () => {
  const { auth, setAuth } = useAuthToken()
  const { token, username } = auth

  const clearToken = () => setAuth(null)

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Switch>
          <PrivateRoute exact path="/project/:id"
                        component={ProjectView}
                        defaultProps={{token}}
                        token={token} />
          <PrivateRoute exact path="/dashboard"
                        component={Dashboard}
                        defaultProps={{token, clearToken, username}}
                        token={token} />
          <Route path="/">
            <LoginPage token={token} setAuth={setAuth} />
          </Route>
        </Switch>
      </Router>
    </ChakraProvider>
  )
}
