import React, { useEffect, useState } from 'react'
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
import { beforeNowString } from '../util/TimeDiff'
import { AuthToken } from '../types/authTypes'
import { ChangePasswordModal } from './dashboard_modals/ChangePasswordModal'
import { DownloadModal } from './dashboard_modals/DownloadModal'
import { NewProjectModal } from './dashboard_modals/NewProjectModal'
import { Project } from '../../../server/src/models/Project'
import { ProjectDescriptor } from '../../../server/src/types/serverTypes'
import { fetchOrLogin } from '../util/FetchTools'

type DashboardProps = {
  token: AuthToken,
  clearToken: () => any,
  username: string
}

export const Dashboard: React.FC<DashboardProps> = ({ token, clearToken, username }) => {
  const dlModalDisclosure = useDisclosure()
  const newModalDisclosure = useDisclosure()
  const passwordModalDisclosure = useDisclosure()

  const [projects, setProjects] = useState([] as Project[])
  const [needsRefresh, setNeedsRefresh] = useState(true)

  const history = useHistory()
  const logOut = () => {
    // tell the server we're logging out
    clearToken()
    history.push('/')
  }

  const openProject = (uuid: string) => {
    history.push(`/project/${uuid}`)
  }

  useEffect(() => {
    if (token === null || !needsRefresh) return

    fetchOrLogin('/api/userProjects', {
      method: 'GET',
      headers: {
        'x-access-token': token
      }
    }, history)
      .then(res => res.json())
      .then(projObj => {
        const { projects } = projObj
        // When we get the project from the server, the modificationDate isn't a Date b/c JSON doesn't handle those
        setProjects(projects.map((proj: Omit<ProjectDescriptor, 'modificationDate'> & {modificationDate: string}) => ({
          _id: proj._id,
          name: proj.name,
          modificationDate: new Date(proj.modificationDate)
        })))
      })
    setNeedsRefresh(false)
  }, [needsRefresh])

  // After cloning a new project, need to refresh project list
  const onClone = () => setNeedsRefresh(true)

  const rowHoverColor = useColorModeValue("gray.200", "gray.700")
  const rowEls = projects
    .sort((a: Project, b: Project) =>
      // Sort by most recently edited
      a.modificationDate < b.modificationDate ? 1
        : a.modificationDate > b.modificationDate ? -1
        : 0
    )
    .map((proj: Project) => (
    <Tr cursor="pointer" _hover={{background: rowHoverColor}}
        key={proj._id} id={proj._id}
        onClick={() => openProject(proj._id)}>
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
              {username}
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
          {rowEls.length > 0
            ? rowEls
            : <Tr><Td colSpan={2} textAlign='center' border='none'>No projects yet!</Td></Tr> }
        </Tbody>
      </Table>

      <NewProjectModal isOpen={newModalDisclosure.isOpen}
                       onClose={newModalDisclosure.onClose}
                       token={token}
                       onClone={onClone} />
      <DownloadModal isOpen={dlModalDisclosure.isOpen}
                     onClose={dlModalDisclosure.onClose}
                     token={token} />
      <ChangePasswordModal isOpen={passwordModalDisclosure.isOpen}
                           onClose={passwordModalDisclosure.onClose}
                           token={token}
                           clearToken={clearToken} />
    </Box>
  )
}