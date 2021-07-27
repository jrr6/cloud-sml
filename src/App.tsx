import * as React from "react"
import {
  ChakraProvider,
  theme,
} from "@chakra-ui/react"
import { CodeEditor } from './components/CodeEditor'

export const App = () => (
  <ChakraProvider theme={theme}>
      {/*<ColorModeSwitcher justifySelf="right" />*/}
      <CodeEditor />
  </ChakraProvider>
)
