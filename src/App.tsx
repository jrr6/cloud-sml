import * as React from "react"
import {
  ChakraProvider,
  theme,
} from "@chakra-ui/react"
import { ProjectView } from './components/ProjectView'
import { LoginPage } from './components/LoginPage'
import { Dashboard } from './components/Dashboard'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

export const App = () => (
  <ChakraProvider theme={theme}>
    <Router>
      <Switch>
        <Route path="/dashboard">
          <Dashboard />
        </Route>
        <Route path="/project/:id">
          <ProjectView />
        </Route>
        <Route path="/">
          <LoginPage />
        </Route>
      </Switch>
    </Router>
  </ChakraProvider>
)
