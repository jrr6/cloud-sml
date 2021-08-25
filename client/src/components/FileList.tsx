import React from 'react'
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
import { ProjectFile } from '../../../server/src/models/Project'
import { AuthToken } from '../types/authTypes'
import { SaveState } from './ProjectView'

type FileListProps = {
  projName: string,
  files: ProjectFile[],
  openIdx: number,
  onToggle: (fileIdx: number) => any,
  onOpen: (fileIdx: number) => any,
  onClose: () => any,
  onRun: () => any,
  saveState: SaveState,
  token: AuthToken
}

export const FileList: React.FC<FileListProps> = props => {
  const { files, openIdx, projName } = props

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

  const statusColor = props.saveState == SaveState.Saved ? 'green'
    : props.saveState == SaveState.Saving ? 'yellow'
      : 'red'
  const statusText = props.saveState == SaveState.Saved ? 'Saved'
    : props.saveState == SaveState.Saving ? 'Saving…'
      : 'Not Saved'

  return (
    <>
      <Flex justifyContent="space-between">
        <Box>
          <Button leftIcon={<MdChevronLeft />}
                  size="sm"
                  variant="ghost"
                  textAlign="left"
                  onClick={_ => props.onClose()}>Exit</Button>
          <Badge variant="outline" colorScheme={statusColor}>
            {statusText}
          </Badge>
        </Box>
        <Button leftIcon={<IoMdPlay color="green" />} onClick={props.onRun}>Run</Button>
      </Flex>
      <Heading as="h3" size="md" marginTop={4}>{projName}</Heading>
      <List marginTop={2} spacing={1} w="100%">
        {fileListItems}
      </List>
    </>
  )

}