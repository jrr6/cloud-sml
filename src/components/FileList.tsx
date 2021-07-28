import React from 'react'
import { Box, Button, Flex, Heading, List, ListIcon, ListItem, Switch, useColorModeValue } from '@chakra-ui/react'
import { IoMdDocument, IoMdPlay, MdChevronLeft } from 'react-icons/all'
import { Project, ProjectFile } from '../types/projectTypes'

type FileListProps = {
  project: Project,
  onToggle: (fileIdx: number) => any,
  onOpen: (fileIdx: number) => any
}

export const FileList: React.FC<FileListProps> = props => {
  const files: Array<ProjectFile> = props.project.files
  const openIdx: number = props.project.openIdx
  const projName: string = props.project.name

  const listHoverColor = useColorModeValue("gray.200", "gray.700")
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
        <Button leftIcon={<MdChevronLeft />} variant="ghost" textAlign="left">Exit</Button>
        <Button leftIcon={<IoMdPlay color="green" />}>Run</Button>
      </Flex>
      <Heading as="h3" size="md" marginTop={4}>{projName}</Heading>
      <List marginTop={2} spacing={3} w="100%">
        {fileListItems}
      </List>
    </>
  )

}