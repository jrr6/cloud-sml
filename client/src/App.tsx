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

export const App = () => {
  const { token, setToken } = useAuthToken()
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Switch>
          <Route exact path="/project/:id">
            <ProjectView/>
          </Route>
          <Route exact path="/dashboard">
            <Dashboard setToken={setToken}/>
          </Route>
          <Route path="/">
            <LoginPage token={token} setToken={setToken} />
          </Route>
        </Switch>
      </Router>
    </ChakraProvider>
  )
}
