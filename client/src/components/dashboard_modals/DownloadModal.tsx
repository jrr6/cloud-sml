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
import React from 'react'

export const DownloadModal: React.FC<DashModalProps & {downloadFiles: () => void}> =
  ({ isOpen, onClose, downloadFiles }) => (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Download Files</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          A copy of all of your Cloud SML files will be downloaded to your computer. This process may take several moments. Would you like to proceed?
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} autoFocus onClick={downloadFiles}>
            Download Files
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )