import React from 'react'
import {
  Box, Button, Flex,
  Heading, IconButton, Menu, MenuButton, MenuItem,
  MenuList,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue, useDisclosure
} from '@chakra-ui/react'
import { ColorModeSwitcher } from './ColorModeSwitcher'
import { BiChevronDown, IoMdAdd, IoMdCloud } from 'react-icons/all'
import { useHistory } from 'react-router-dom'
import { Project } from '../types/projectTypes'
import { beforeNowString } from '../util/TimeDiff'
import { AuthToken } from '../types/authTypes'
import { ChangePasswordModal } from './dashboard_modals/ChangePasswordModal'
import { DownloadModal } from './dashboard_modals/DownloadModal'
import { NewProjectModal } from './dashboard_modals/NewProjectModal'

type DashboardProps = {
  token: AuthToken,
  setToken: (token: AuthToken) => any
}

export const Dashboard: React.FC<DashboardProps> = ({ token, setToken }) => {
  const dlModalDisclosure = useDisclosure()
  const newModalDisclosure = useDisclosure()
  const passwordModalDisclosure = useDisclosure()

  const downloadFiles = () => {
    console.log("Downloading files...")
    dlModalDisclosure.onClose()
  }

  const history = useHistory()
  const logOut = () => {
    // tell the server we're logging out
    setToken(null)
    history.push('/')
  }

  const openProject = (uuid: string) => {
    history.push(`/project/${uuid}`)
  }

  const projects = [
    {
      uuid: 'daufdaf783-aof9393',
      modificationDate: new Date(2021, 6, 28, 15, 14, 0, 0),
      creationDate: new Date(2019, 0, 1, 0, 0, 0, 0),
      name: '5.2 - Datatypes & Polymorphism',
      openIdx: 1,
      files: [
        {name: "task2.sml", contents: "(* Functions are values! *)", active: false},
        {name: "task3.sml", contents: "fun fact 0 = 1\n  | fact n = n * fact (n - 1)", active: true},
        {name: "task4.sml", contents: "val () = print \"Hello, world!\"", active: true}
      ]
    }
  ]

  const rowHoverColor = useColorModeValue("gray.200", "gray.700")
  const rowEls = projects.map((proj : Project) => (
    <Tr cursor="pointer" _hover={{background: rowHoverColor}}
        key={proj.uuid} id={proj.uuid}
        onClick={() => openProject(proj.uuid)}>
        <Td>{proj.name}</Td>
        <Td>{beforeNowString(proj.modificationDate)}</Td>
    </Tr>
  ))

  return (
    <Box p={5}>
      <Flex justifyContent="space-between">
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <IoMdCloud size={30} />
          <Heading as="h3" size="lg" marginLeft={2}>Cloud SML</Heading>
        </Box>
        <Box>
          <IconButton aria-label="New project"
                      colorScheme="blue"
                      variant="outline"
                      icon={<IoMdAdd />}
                      onClick={newModalDisclosure.onOpen} />
          <ColorModeSwitcher />
          <Menu>
            <MenuButton as={Button} variant="ghost" rightIcon={<BiChevronDown />}>
              yourusername
            </MenuButton>
            <MenuList>
              <MenuItem onClick={passwordModalDisclosure.onOpen}>Change Password&hellip;</MenuItem>
              <MenuItem onClick={dlModalDisclosure.onOpen}>Download Files&hellip;</MenuItem>
              <MenuItem onClick={logOut}>Log Out</MenuItem>
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

      <NewProjectModal isOpen={newModalDisclosure.isOpen}
                       onClose={newModalDisclosure.onClose}
                       token={token} />
      <DownloadModal isOpen={dlModalDisclosure.isOpen}
                     onClose={dlModalDisclosure.onClose}
                     downloadFiles={downloadFiles} />
      <ChangePasswordModal isOpen={passwordModalDisclosure.isOpen}
                           onClose={passwordModalDisclosure.onClose} />

    </Box>
  )
}