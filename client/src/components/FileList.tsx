import React, { useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  List,
  ListIcon,
  ListItem,
  Switch,
  useColorModeValue
} from '@chakra-ui/react'
import { IoMdDocument, IoMdPlay, MdChevronLeft } from 'react-icons/all'
import { Project, ProjectFile } from '../../../server/src/models/User'
import { AuthToken } from '../types/authTypes'
import { Workspace } from '../../../server/src/models/Workspace'

type FileListProps = {
  project: Project,
  onToggle: (fileIdx: number) => any,
  onOpen: (fileIdx: number) => any,
  onClose: () => any,
  isSaved: boolean,
  token: AuthToken
}

export const FileList: React.FC<FileListProps> = props => {
  const [files, setFiles] = useState([] as ProjectFile[])
  const openIdx: number = props.project.openIdx
  const projName: string = props.project.name

  useEffect(() => {
    if (props.token === null) return

    const url = new URL('http://localhost:8081/api/workspace')
    const params = {workspaceId: props.project.workspaceId}
    url.search = new URLSearchParams(params).toString()

    //@ts-ignore URLs are perfectly valid arguments to fetch
    fetch(url, {
      method: 'GET',
      headers: {
        'x-access-token': props.token
      }
    })
      .then(res => res.json())
      .then(wkspResp => {
        const workspace: Workspace = wkspResp.workspace
        setFiles(workspace.files)
      })
  }, [])

  const listHoverColor = useColorModeValue("gray.300", "gray.700")
  const fileListItems = files.map ((file, idx) => (
    <ListItem w="100%" p={1} cursor="pointer" _hover={{background: listHoverColor}}
              key={file.name} background={idx === openIdx ? listHoverColor : "default"}>
      <Flex justifyContent="space-between">
        <Box flexGrow={1} onClick={_ => props.onOpen(idx)}>
          <ListIcon as={IoMdDocument} />
          {file.name}
        </Box>
        <Switch isChecked={file.active} onChange={evt => {
          evt.stopPropagation()
          evt.preventDefault()
          props.onToggle(idx)
        }} />
      </Flex>
    </ListItem>
  ))

  return (
    <>
      <Flex justifyContent="space-between">
        <Box>
          <Button leftIcon={<MdChevronLeft />}
                  size="sm"
                  variant="ghost"
                  textAlign="left"
                  onClick={_ => props.onClose()}>Exit</Button>
          <Badge variant="outline" colorScheme={props.isSaved ? "green" : "yellow"}>
            {props.isSaved ? "Saved" : "Saving…"}
          </Badge>
        </Box>
        <Button leftIcon={<IoMdPlay color="green" />}>Run</Button>
      </Flex>
      <Heading as="h3" size="md" marginTop={4}>{projName}</Heading>
      <List marginTop={2} spacing={1} w="100%">
        {fileListItems}
      </List>
    </>
  )

}