import * as React from "react"
import {
  ChakraProvider,
  theme,
} from "@chakra-ui/react"
import { ProjectView } from './components/ProjectView'
import { ColorModeSwitcher } from './ColorModeSwitcher'

export const App = () => (
  <ChakraProvider theme={theme}>
      <ColorModeSwitcher position="absolute" />
      <ProjectView />
  </ChakraProvider>
)
