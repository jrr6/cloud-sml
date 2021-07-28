import React from 'react'
import {
  Box,
  Divider,
  Flex,
  Grid,
  GridItem,
  useColorModeValue
} from '@chakra-ui/react'
import { CodeEditor } from './CodeEditor'
import { FileList } from './FileList'

type ProjectViewProps = { name: string }

export const ProjectView: React.FC<ProjectViewProps> = ({ name }) => {
  // TODO: actually fetch the project
  const project = {
    name: name,
    openIdx: 1,
    files: [
      {name: "task2.sml", contents: "(* Functions are values! *)", active: false},
      {name: "task3.sml", contents: "fun fact 0 = 1\n  | fact n = n * fact (n - 1)", active: true},
      {name: "task4.sml", contents: "val () = print \"Hello, world!\"", active: true}
    ]
  }
  const [openIdx, setOpenIdx] = React.useState(project.openIdx)
  const [files, setFiles] = React.useState(project.files)

  const onOpen = (fileIdx: number) => {
    setOpenIdx(fileIdx)
  }
  const onToggle = (fileIdx: number) => {
    const oldFile = files[fileIdx]
    const newFile = {name: oldFile.name, contents: oldFile.contents, active: !oldFile.active}
    setFiles([...files.slice(0, fileIdx), newFile, ...files.slice(fileIdx + 1)])
  }

  const onEdit = (contents: string) => {
    const oldFile = files[openIdx]
    const newFile = {name: oldFile.name, contents: contents, active: oldFile.active}
    setFiles([...files.slice(0, openIdx), newFile, ...files.slice(openIdx + 1)])
  }

  const newProject = {...project, files: files, openIdx: openIdx}

  return (
    <Grid templateColumns="repeat(10, 1fr)" w="100%" gap={0}>
      {/* File List */}
      <GridItem colSpan={2} p={5} background={useColorModeValue("gray.200", "default")}>
        <FileList project={newProject} onOpen={onOpen} onToggle={onToggle} />
      </GridItem>

      {/* Editor */}
      <GridItem colSpan={5}>
        <Flex>
          <Box><Divider orientation="vertical"/></Box>
          <CodeEditor file={files[openIdx]} onEdit={onEdit} />
          <Box><Divider orientation="vertical"/></Box>
        </Flex>
      </GridItem>

      {/* Terminal */}
      <GridItem colSpan={3}>
        <p>This is where the terminal goes</p>
      </GridItem>
    </Grid>
  )
}