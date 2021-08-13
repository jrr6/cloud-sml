import { DashModalProps } from '../../types/modalTypes'
import {
  Button, Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { AuthToken } from '../../types/authTypes'

export const DownloadModal: React.FC<DashModalProps & {token: AuthToken}> =
  ({ isOpen, onClose, token }) => {
  const [loading, setLoading] = useState(false)
  const downloadFiles = () => {
    if (token === null) return;
    setLoading(true)
    fetch('http://localhost:8081/api/downloadFiles', {
      method: 'GET',
      headers: {
        'x-access-token': token
      }
    })
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'cloudsml-export.zip', { type: 'application/zip' })
        window.open(URL.createObjectURL(file))
        setLoading(false)
        onClose()
      })
      .catch(_ => setLoading(false))
  }
  const closeAction = !loading ? onClose : () => {}
  return (
      <Modal isOpen={isOpen} onClose={closeAction}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Download Files</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            A copy of all of your Cloud SML files will be downloaded to your computer. This process may take several moments. Would you like to proceed?
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} autoFocus onClick={downloadFiles} isLoading={loading}>
              Download Files
            </Button>
            <Button variant="ghost" onClick={closeAction} disabled={loading}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
}