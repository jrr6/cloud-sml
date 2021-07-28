import React from 'react'
import {
  Box, Button, Flex,
  Heading, IconButton, Menu, MenuButton, MenuItem,
  MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  Table,
  TableCaption,
  Tbody,
  Td, Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  useColorModeValue, useDisclosure
} from '@chakra-ui/react'
import { ColorModeSwitcher } from '../ColorModeSwitcher'
import { BiChevronDown, IoMdAdd, IoMdDownload } from 'react-icons/all'


export const Dashboard = () => {
  const dlModalDisclosure = useDisclosure()
  const dlModalOpen = dlModalDisclosure.isOpen
  const onDlModalOpen = dlModalDisclosure.onOpen
  const onDlModalClose = dlModalDisclosure.onClose

  const newModalDisclosure = useDisclosure()
  const newModalOpen = newModalDisclosure.isOpen
  const onNewModalOpen = newModalDisclosure.onOpen
  const onNewModalClose = newModalDisclosure.onClose

  const downloadFiles = () => {
    console.log("Downloading files...")
    onDlModalClose()
  }

  const rowHoverColor = useColorModeValue("gray.200", "gray.700")
  const rowEls = ["Playground", "5.1 - Lists & Structural Induction", "5.2 - Datatypes & Polymorphism"].map((e : string) => (
    <Tr cursor="pointer" _hover={{background: rowHoverColor}} key={e}>
      <Td>{e}</Td>
      <Td>3 hours ago</Td>
    </Tr>
  ))

  // const availableProjectTemplates: Array<string> = []
  const availableProjectTemplates = ["5.3 - Sorting", "5.4 - Graphs"]

  return (
    <Box p={5}>
      <Flex justifyContent="space-between">
        <Heading as="h3" size="lg">Cloud SML</Heading>
        <Box>
          <IconButton aria-label="New project"
                      colorScheme="blue"
                      variant="outline"
                      icon={<IoMdAdd />}
                      onClick={onNewModalOpen} />
          <ColorModeSwitcher />
          <Menu>
            <MenuButton as={Button} variant="ghost" rightIcon={<BiChevronDown />}>
              yourusername
            </MenuButton>
            <MenuList>
              <MenuItem onClick={onDlModalOpen}>Download Files&hellip;</MenuItem>
              <MenuItem>Log Out</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
      <Table variant="simple" marginTop={5}>
        <Thead>
          <Tr>
            <Th>Project Name</Th>
            <Th>Last Modified</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rowEls}
        </Tbody>
      </Table>

      {/* New project modal */}
      <Modal isOpen={newModalOpen} onClose={onNewModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {
              availableProjectTemplates.length === 0
                ? <Text fontSize="lg">No templates available</Text>
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

      {/* Download modal */}
      <Modal isOpen={dlModalOpen} onClose={onDlModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Download Files</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            A copy of all of your Cloud SML files will be downloaded to your computer. This process may take several moments. Would you like to proceed?
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={downloadFiles}>
              Download Files
            </Button>
            <Button variant="ghost" onClick={onDlModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}