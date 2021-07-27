import * as React from "react"
import {
  ChakraProvider,
  theme,
} from "@chakra-ui/react"
import { LoginPage } from './components/LoginPage'

export const App = () => (
  <ChakraProvider theme={theme}>
      {/*<ColorModeSwitcher justifySelf="right" />*/}
      <LoginPage />
  </ChakraProvider>
)
