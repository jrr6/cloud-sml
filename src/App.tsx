import * as React from "react"
import {
  ChakraProvider,
  theme,
} from "@chakra-ui/react"
import { ProjectView } from './components/ProjectView'
import { ColorModeSwitcher } from './ColorModeSwitcher'
import { LoginPage } from './components/LoginPage'
import { Dashboard } from './components/Dashboard'

export const App = () => (
  <ChakraProvider theme={theme}>
      {/*<ProjectView name="5.2 - Datatypes & Polymorphism" />*/}
    <Dashboard />
  </ChakraProvider>
)
