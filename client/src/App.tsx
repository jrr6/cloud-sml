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
  const { token, setToken } = useAuthToken()
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Switch>
          <PrivateRoute exact path="/project/:id" component={ProjectView} token={token} />
          <PrivateRoute exact path="/dashboard" component={Dashboard} defaultProps={{setToken: setToken}} token={token} />
          <Route path="/">
            <LoginPage token={token} setToken={setToken} />
          </Route>
        </Switch>
      </Router>
    </ChakraProvider>
  )
}
