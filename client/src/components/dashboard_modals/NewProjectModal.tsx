import {
  Button, Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody, Td,
  Text, Tr
} from '@chakra-ui/react'
import { IoMdDownload } from 'react-icons/all'
import React from 'react'
import { DashModalProps } from '../../types/modalTypes'

export const NewProjectModal: React.FC<DashModalProps> = ({ isOpen, onClose }) => {
  // TODO: fetch templates in here (ideally refreshing each time modal opened)
  // const availableProjectTemplates: Array<string> = []
  const availableProjectTemplates = ["5.3 - Sorting", "5.4 - Graphs"]

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Project</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {
            availableProjectTemplates.length === 0
              ? <Text fontSize="lg" marginBottom={3}>No templates available</Text>
              : <Table variant="simple">
                <Tbody>
                  {availableProjectTemplates.map((e : string) => (
                    <Tr key={e}>
                      <Td>{e}</Td>
                      <Td><Button colorScheme="blue" leftIcon={<IoMdDownload />}>Add</Button></Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}