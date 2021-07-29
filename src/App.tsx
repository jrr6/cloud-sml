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
  console.log(token)
  return (
    <ChakraProvider theme={theme}>
      {token === undefined
      ? <LoginPage setToken={setToken} />
      : <Router>
          <Switch>
            <Route path="/project/:id">
              <ProjectView/>
            </Route>
            <Route path="/">
              <Dashboard setToken={setToken}/>
            </Route>
          </Switch>
        </Router>}
    </ChakraProvider>
  )
}
