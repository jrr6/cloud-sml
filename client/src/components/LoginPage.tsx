import {
  Alert, AlertIcon,
  Box,
  Button, Flex,
  Input,
  InputGroup,
  InputRightElement,
  Stack
} from '@chakra-ui/react'
import React, { FormEvent, useEffect } from 'react'
import { ColorModeSwitcher } from './ColorModeSwitcher'
import { useHistory } from 'react-router-dom'
import { AuthToken } from '../types/authTypes'

type LoginPageProps = {
  token: AuthToken,
  setToken: (token: AuthToken) => any
}

const postLoginReq = (creds: {username: string, password: string}) =>
  // new Promise<AuthToken>((resolve) => setTimeout(() => resolve({token: "mysecretkey"}), 500))
  fetch('http://localhost:8081/login', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(creds)
  }).then(data => data.json())

export const LoginPage: React.FC<LoginPageProps> = ({ token, setToken }) => {
  const history = useHistory()
  const [show, setShow] = React.useState(false)
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [loginError, setLoginError] = React.useState(false)
  const handleShowClick = () => setShow(!show)

  useEffect(() => {
    if (token !== null) {
      fetch('http://localhost:8081/isAuthenticated', {
        method: 'GET',
        headers: {
          'x-access-token': token
        }
      })
        .then(res => res.json())
        .then(data => data.isLoggedIn ? history.push('/dashboard') : null)
    }
  }, [])

  const submit = async (evt : FormEvent) => {
    evt.preventDefault()
    setLoading(true);
    try {
      const res = await postLoginReq({
        username,
        password
      })
      if (res.token !== undefined) {
        setToken(res.token)
        setLoading(false)
        setLoginError(false)
        history.push('/dashboard')
      } else {
        setLoading(false)
        setLoginError(true)
      }
    } catch {
      setLoading(false)
      setLoginError(true)
    }
  }

  return (
    <Box p={5}>
      <ColorModeSwitcher float="right" />
      <form onSubmit={submit}>
        <Flex p={10} width="full" align="center" justifyContent="center">
        <Box p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg">
          <Stack spacing={3}>
            <Input placeholder="username"
                   onChange={evt => setUsername(evt.currentTarget.value)} />
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                type={show ? "text" : "password"}
                placeholder="password"
                onChange={evt => setPassword(evt.currentTarget.value)}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleShowClick}>
                  {show ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            {loginError && <Alert status="error" variant="left-accent">
              <AlertIcon />
              Incorrect username or password
            </Alert>}
            <Button colorScheme="teal" variant="solid" type="submit" isLoading={loading}>
              Log In
            </Button>
          </Stack>
        </Box>
        </Flex>
      </form>
    </Box>
  )
}