import React from 'react'
import {
  Alert, AlertIcon,
  Button, Input, InputGroup, InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay, Stack
} from '@chakra-ui/react'
import { DashModalProps } from '../../types/modalTypes'

const MIN_PASSWORD_LENGTH = 8

export const ChangePasswordModal: React.FC<DashModalProps> = ({ isOpen, onClose }) => {
  const [current, setCurrent] = React.useState('')
  const [newIn, setNewIn] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [show, setShow] = React.useState(false)
  const [allowSubmit, setAllowSubmit] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [loginError, setLoginError] = React.useState(false)
  const protectedClose = () => {
    setCurrent('')
    setNewIn('')
    setConfirm('')
    setShow(false)
    setAllowSubmit(false)
    setLoading(false)
    setLoginError(false)
    onClose()
  }

  const updateNewEntry = (newEntry: string, isConfirmation: boolean) => {
    if (isConfirmation) {
      setConfirm(newEntry)
      setAllowSubmit(newEntry === newIn && newEntry.length >= MIN_PASSWORD_LENGTH)
    } else {
      setNewIn(newEntry)
      setAllowSubmit(newEntry === confirm && newEntry.length >= MIN_PASSWORD_LENGTH)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={protectedClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Change Password</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={3} marginBottom={5}>
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                type={show ? "text" : "password"}
                placeholder="current password"
                value={current}
                onChange={evt => setCurrent(evt.currentTarget.value)}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" tabIndex={-1} onClick={() => {setShow(!show)}}>
                  {show ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            <Input placeholder="new password"
                   type={show ? "text" : "password"}
                   value={newIn}
                   onChange={evt => updateNewEntry(evt.currentTarget.value, false)} />
            <Input placeholder="confirm new password"
                   type={show ? "text" : "password"}
                   value={confirm}
                   onChange={evt => updateNewEntry(evt.currentTarget.value, true)} />
            {loginError && <Alert status="error" variant="left-accent">
              <AlertIcon />
              Incorrect password
            </Alert>}
            <Button colorScheme="teal" variant="solid" type="submit" isLoading={loading} disabled={!allowSubmit}>
              Change Password
            </Button>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}