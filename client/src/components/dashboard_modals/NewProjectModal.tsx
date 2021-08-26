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
import React, { useEffect, useState } from 'react'
import { DashModalProps } from '../../types/modalTypes'
import { ProjectTemplate } from '../../../../server/src/models/ProjectTemplate'
import { AuthToken } from '../../types/authTypes'

export const NewProjectModal: React.FC<DashModalProps & {token: AuthToken, onClone: () => void}> =
  ({ isOpen, onClose, token, onClone }) => {
  const [templates, setTemplates] = useState([] as ProjectTemplate[])
  // Fetch templates anew each time we open the modal (hence isOpen dep)
  useEffect(() => {
    if (isOpen && token !== null) {
      fetch('http://localhost:8081/api/templates', {
        method: 'GET',
        headers: {
          'x-access-token': token
        }
      })
        .then(res => res.json())
        .then(resBody => setTemplates(resBody.templates))
    }
  }, [isOpen])

  const cloneTemplate = (templateId: string) => {
    fetch('http://localhost:8081/api/cloneTemplate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token!
      },
      body: JSON.stringify({
        templateId
      })
    }).then(res => {
       if (res.ok) {
         onClone()
         onClose()
       }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Project</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {
            templates.length === 0
              ? <Text fontSize="lg" marginBottom={3}>No templates available</Text>
              : <Table variant="simple">
                <Tbody>
                  {templates.map(({ _id, name }) => (
                    <Tr key={_id}>
                      <Td>{name}</Td>
                      <Td><Button colorScheme="blue"
                                  leftIcon={<IoMdDownload />}
                                  onClick={() => cloneTemplate(_id)}>Add</Button></Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}