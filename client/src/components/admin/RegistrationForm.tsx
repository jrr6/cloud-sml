import React, { FormEvent, useState } from 'react'
import { Alert, AlertIcon, Button, Heading, Input, Stack } from '@chakra-ui/react'
import { OperationState } from '../AdminPanel'

type RegistrationFormProps = { token: string }
export const RegistrationForm: React.FC<RegistrationFormProps> = ({ token }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [registerState, setRegisterState] = useState(OperationState.NoOp)

  const registerUser = (e: FormEvent) => {
    e.preventDefault()
    fetch('http://localhost:8081/api/register', {
      method: 'POST',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    })
      .then(res => {
        setRegisterState(res.ok ? OperationState.Success : OperationState.Failure)
        setUsername('')
        setPassword('')
      })
  }
  return (
    <>
      <Heading as='h3' size='lg' marginBottom={10}>Register User</Heading>
      <form onSubmit={registerUser}>
        <Stack spacing={3}>
          <Input placeholder='username' value={username} onChange={e => { setUsername(e.target.value) }} />
          <Input placeholder='password' value={password} onChange={e => { setPassword(e.target.value) }} />
          <Button type='submit' colorScheme='green' disabled={username === '' || password === ''}>Register</Button>
          {registerState !== OperationState.NoOp &&
          <Alert status={registerState === OperationState.Success ? 'success' : 'error'} variant="left-accent">
            <AlertIcon />
            {registerState === OperationState.Success ? 'User registered successfully' : 'Failed to register user'}
          </Alert>}
        </Stack>
      </form>
    </>
  )
}