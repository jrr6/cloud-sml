import React, { useEffect, useState } from 'react'
import {
  Box,
  Divider,
  Flex,
  Grid,
  GridItem,
  useColorModeValue
} from '@chakra-ui/react'
import { useHistory, useParams } from 'react-router-dom'
import { CodeEditor } from './CodeEditor'
import { FileList } from './FileList'
import { AuthToken } from '../types/authTypes'
import { Project, ProjectFile } from '../../../server/src/models/Project'

type ProjectViewProps = { token: AuthToken }

export const ProjectView: React.FC<ProjectViewProps> = ({ token }) => {
  const { id } = useParams()

  // TODO: actually fetch the project
  // const project = {
  //   workspaceId: 'daufdaf783-aof9393',
  //   name: '5.2 - Datatypes & Polymorphism',
  //   modificationDate: new Date(),
  //   creationDate: new Date(),
  //   openIdx: 1,
  //   files: [
  //     {name: "task2.sml", contents: "(* Functions are values! *)", active: false},
  //     {name: "task3.sml", contents: "fun fact 0 = 1\n  | fact n = n * fact (n - 1)", active: true},
  //     {name: "task4.sml", contents: "val () = print \"Hello, world!\"", active: true}
  //   ]
  // }
  const [files, setFiles] = useState([] as ProjectFile[])
  const [projName, setProjName] = useState('')
  const [openIdx, setOpenIdx] = useState(0)
  const [isSaved, setIsSaved] = useState(true)
  const [loaded, setLoaded] = useState(false)

  const history = useHistory()

  const onOpen = (fileIdx: number) => {
    setOpenIdx(fileIdx)
  }
  const onToggle = (fileIdx: number) => {
    const oldFile = files[fileIdx]
    const newFile = {name: oldFile.name, contents: oldFile.contents, active: !oldFile.active}
    setFiles([...files.slice(0, fileIdx), newFile, ...files.slice(fileIdx + 1)])
  }
  const onEdit = (contents: string) => {
    setIsSaved(false)
    const oldFile = files[openIdx]
    const newFile = {name: oldFile.name, contents: contents, active: oldFile.active}
    setFiles([...files.slice(0, openIdx), newFile, ...files.slice(openIdx + 1)])
    setIsSaved(true)
  }
  const onClose = () => {
    // save stuff & shut down stuff
    history.push("/dashboard")
  }

  useEffect(() => {
    if (token === null) return

    const url = new URL('http://localhost:8081/api/project')
    const params = {projectId: id}
    url.search = new URLSearchParams(params).toString()

    //@ts-ignore URLs are perfectly valid arguments to fetch
    fetch(url, {
      method: 'GET',
      headers: {
        'x-access-token': token
      }
    })
      .then(res => res.json())
      .then(projResp => {
        const project: Project = projResp.project
        setFiles(project.files)
        setOpenIdx(project.openIdx)
        setProjName(project.name)
        setLoaded(true)
      })
  }, [])

  return (
    <Grid templateColumns="repeat(10, 1fr)" w="100%" gap={0}>
      {/* File List */}
      <GridItem colSpan={2} p={5} background={useColorModeValue("gray.200", "default")}>
        {loaded &&
        <FileList projName={projName}
                  files={files}
                  openIdx={openIdx}
                  token={token}
                  onOpen={onOpen}
                  onToggle={onToggle}
                  onClose={onClose}
                  isSaved={isSaved} />
        }
      </GridItem>

      {/* Editor */}
      <GridItem colSpan={5}>
        <Flex>
          <Box><Divider orientation="vertical"/></Box>
          {loaded &&
          <CodeEditor file={files[openIdx]} onEdit={onEdit}/>
          }
          <Box><Divider orientation="vertical"/></Box>
        </Flex>
      </GridItem>

      {/* Terminal */}
      <GridItem colSpan={3}>
        {loaded &&
        <p>This is where the terminal goes</p>
        }
      </GridItem>
    </Grid>
  )
}