import React, { FormEvent, useState } from 'react'
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Heading,
  HStack,
  Input,
  Stack, useColorModeValue,
  useRadio,
  useRadioGroup,
  UseRadioProps
} from '@chakra-ui/react'
import { OperationState } from '../AdminPanel'
import { ChangePasswordResponse, RegistrationResponse } from '../../../../server/src/types/serverTypes'

const RadioCard = (props: UseRadioProps & {children: React.ReactNode, idx: number}) => {
  const { getInputProps, getCheckboxProps } = useRadio(props)
  const input = getInputProps()
  const checkbox = getCheckboxProps()
  const backgroundColor = useColorModeValue('green.100', 'green.700')
  const textColor = useColorModeValue('black', 'white')
  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderLeftRadius={props.idx === 0 ? "md" : '0'}
        borderRightRadius={props.idx === 1 ? "md" : '0'}
        boxShadow="md"
        margin={0}
        _checked={{
          bg: backgroundColor,
          color: textColor,
          borderColor: backgroundColor,
        }}
        px={5}
        py={1}
      >
        {props.children}
      </Box>
    </Box>
  )
}

type UserManagementFormProps = { token: string }
export const UserManagementForm: React.FC<UserManagementFormProps> = ({ token }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [action, setAction] = useState('Register')
  const [resultState, setResultState] = useState(OperationState.NoOp)
  const [errorMessage, setErrorMessage] = useState('')

  const doAction = (e: FormEvent) => {
    e.preventDefault();

    (action === 'Register'
      ? fetch('http://localhost:8081/api/register', {
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
      : fetch('http://localhost:8081/api/changePassword', {
        method: 'POST',
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminForUser: username,
          newPassword: password
        })
      })
    )
      .then((res: Response) => {
        setUsername('')
        setPassword('')
        if (res.ok) {
          setResultState(OperationState.Success)
        } else {
          // The fetch API is stupid, so we don't know whether the error code will land use here
          // or in the catch
          res.json().then((resObj : RegistrationResponse | ChangePasswordResponse) => {
            setErrorMessage(`Operation failed: ${resObj.message}`)
            setResultState(OperationState.Failure)
          })
        }
      }).catch(res => {
        setErrorMessage(`Operation failed: ${res.message}`)
        setResultState(OperationState.Failure)
    })
  }

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'action',
    defaultValue: 'Register',
    onChange: setAction
  })
  const group = getRootProps()
  const actionOptions = ['Register', 'Reset Password']

  return (
    <>
      <Heading as='h3' size='lg' marginBottom={5}>Manage Users</Heading>
      <form onSubmit={doAction}>
        <Stack spacing={3} align='center'>
          <Input placeholder='username' value={username} onChange={e => { setUsername(e.target.value) }} />
          <Input placeholder='password' value={password} onChange={e => { setPassword(e.target.value) }} />
          <HStack {...group} spacing={0}>
            {actionOptions.map((value, idx) => (
              //@ts-ignore this is literally from their own sample code
              <RadioCard key={value} idx={idx} {...getRadioProps({ value })}>{value}</RadioCard>
            ))}
          </HStack>
          <Button width='100%' type='submit' colorScheme='green' disabled={username === '' || password === ''}>Submit</Button>
          {resultState !== OperationState.NoOp &&
          <Alert status={resultState === OperationState.Success ? 'success' : 'error'} variant="left-accent">
            <AlertIcon />
            {resultState === OperationState.Success ? 'Operation successful' : errorMessage}
          </Alert>}
        </Stack>
      </form>
    </>
  )
}