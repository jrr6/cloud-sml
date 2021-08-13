import React, { useEffect, useRef, useState } from 'react'
import { Box, Divider, Flex, Grid, GridItem, useColorModeValue } from '@chakra-ui/react'
import { Prompt, useHistory, useParams } from 'react-router-dom'
import { CodeEditor } from './CodeEditor'
import { FileList } from './FileList'
import { AuthToken } from '../types/authTypes'
import { Project, ProjectFile } from '../../../server/src/models/Project'

type ProjectViewProps = { token: AuthToken }
export enum SaveState {
  Saved,
  Saving,
  Failed
}

export const ProjectView: React.FC<ProjectViewProps> = ({ token }) => {
  const SAVE_DELAY_TIMEOUT_MS = 500

  const { id } = useParams()

  const [files, setFiles] = useState([] as ProjectFile[])
  const [projName, setProjName] = useState('')
  const [openIdx, setOpenIdx] = useState(0)
  const [saveState, setSaveState] = useState(SaveState.Saved)
  const [loaded, setLoaded] = useState(false)
  const [pendingSave, setPendingSave] = useState(null as number | null)
  const activeFileContents = useRef<string>()

  const history = useHistory()

  useEffect(() => {
    window.onbeforeunload = () => {
      return activeFileContents.current !== undefined
        ? 'Your changes have not yet been saved. Do you want to continue?'
        : undefined
    }
  }, [])

  const onOpen = (fileIdx: number) => {
    if (pendingSave) clearTimeout(pendingSave)
    if (activeFileContents.current !== undefined) {
      performSave()
        .then(() => setOpenIdx(fileIdx))
    } else {
      setOpenIdx(fileIdx)
    }
  }
  const onToggle = (fileIdx: number) => {
    const oldFile = files[fileIdx]
    const newFile = {name: oldFile.name, contents: oldFile.contents, active: !oldFile.active}
    setFiles([...files.slice(0, fileIdx), newFile, ...files.slice(fileIdx + 1)])
  }
  const onEdit = (contents: string) => {
    setSaveState(SaveState.Saving)
    // Save locally
    const oldFile = files[openIdx]
    const newFile = {name: oldFile.name, contents: contents, active: oldFile.active}
    setFiles([...files.slice(0, openIdx), newFile, ...files.slice(openIdx + 1)])

    // Save to server (eventually)
    activeFileContents.current = contents
    if (pendingSave) clearTimeout(pendingSave)
    // For some reason we're defaulting to Node.JS types instead of DOM
    setPendingSave(setTimeout(performSave, SAVE_DELAY_TIMEOUT_MS) as unknown as number)
  }
  const onClose = () => {
    // save stuff & shut down stuff
    if (pendingSave) clearTimeout(pendingSave)
    if (activeFileContents.current !== undefined) {
      performSave()
        .then(() => history.push('/dashboard'))
    } else {
      history.push('/dashboard')
    }
  }

  const performSave = () => new Promise((res, rej) => {
    if (token == null) return rej()
    fetch('http://localhost:8081/api/saveFile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      body: JSON.stringify({
        projectId: id,
        fileIdx: openIdx,
        newContents: activeFileContents.current
      })
    })
      .then(resp => {
        if (resp.ok) {
          setSaveState(SaveState.Saved)
          activeFileContents.current = undefined
          return res()
        } else {
          setSaveState(SaveState.Failed)
          return rej()
        }
      })
      .catch(_ => {
        setSaveState(SaveState.Failed)
        return rej()
      })
  })

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
      {/* Navigation-before-save warning prompt */}
      <Prompt
        when={activeFileContents.current !== undefined}
        message='You have unsaved changes. Are you sure you want to proceed?'
      />

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
                  saveState={saveState} />
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