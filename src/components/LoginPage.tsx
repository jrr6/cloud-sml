import {
  Box,
  Button, Flex,
  Input,
  InputGroup,
  InputRightElement,
  Stack
} from '@chakra-ui/react'
import React, { FormEvent } from 'react'

export const LoginPage = () => {
  const [show, setShow] = React.useState(false)
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const handleClick = () => setShow(!show)
  const submit = (evt : FormEvent) => {
    evt.preventDefault()
    setLoading(true);
    console.log(username, password)
  }

  return (
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
            fontFamily="monospace"
            placeholder="password"
            onChange={evt => setPassword(evt.currentTarget.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        <Button colorScheme="teal" variant="solid" type="submit" isLoading={loading}>
          Log In
        </Button>
      </Stack>
    </Box>
    </Flex>
    </form>
  )
}