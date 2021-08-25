import React, { useEffect, useRef, useState } from 'react'
import { Box, Divider, Flex, Grid, GridItem, useColorModeValue } from '@chakra-ui/react'
import { useHistory, useParams } from 'react-router-dom'
import { CodeEditor } from './CodeEditor'
import { FileList } from './FileList'
import { Project, ProjectFile } from '../../../server/src/models/Project'
import { Terminal } from './Terminal'

type ProjectViewProps = { token: string }
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
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [lastRun, setLastRun] = useState(null as Date | null)
  const activeFileContents = useRef<string>()

  const history = useHistory()

  // Prevent ugly semi-scrolling caused by various hidden elements
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'visible' }
  }, [])

  useEffect(() => {
    const confirmation = 'You have unsaved changes, which will be lost if you continue. Are you sure you want to exit?'
    const interceptor = (e: Event) => {
      if (activeFileContents.current !== undefined) {
        e.preventDefault()
        e.returnValue = false // Chrome makes us do this for some reason
        return confirmation
      } else {
        return undefined
      }
    }
    window.addEventListener('beforeunload', interceptor, false)

    //@ts-ignore returning true is the only way to allow unimpeded navigation, so I don't know why the type prevents it
    const unblock = history.block((_loc, _act) => {
      return activeFileContents.current === undefined
    })

    return () => {
      unblock()
      window.removeEventListener('beforeunload', interceptor, false)
    }
  }, [])

  const onOpen = (fileIdx: number) => {
    if (pendingSave) clearTimeout(pendingSave)

    const doOpen = () => {
      if (token === null) return
      setOpenIdx(fileIdx)
      // Remembering open file is more of a convenience,
      // so we won't worry about following up on the promise
      fetch('http://localhost:8081/api/setOpenFile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({
          projectId: id,
          fileIdx
        })
      })
    }

    if (activeFileContents.current !== undefined) {
      performSave()
        .then(() => doOpen())
    } else {
      doOpen()
    }
  }
  const onToggle = (fileIdx: number) => {
    if (token === null) return
    const oldFile = files[fileIdx]
    const newState = !oldFile.active
    const newFile = {name: oldFile.name, contents: oldFile.contents, active: newState}
    setFiles([...files.slice(0, fileIdx), newFile, ...files.slice(fileIdx + 1)])
    // Another "convenience," so we ignore the promise
    fetch('http://localhost:8081/api/toggleFile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      body: JSON.stringify({
        projectId: id,
        fileIdx,
        active: newState
      })
    })
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

  const onRun = () => {
    setIsTerminalOpen(true)
    setLastRun(new Date())
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
      // TODO: fail gracefully (i.e., redirect to login) if token is invalid
      .then(projResp => {
        const project: Project = projResp.project
        setFiles(project.files)
        setOpenIdx(project.openIdx)
        setProjName(project.name)
        setLoaded(true)
      })
  }, [])

  return (
    <Grid templateColumns="repeat(10, 1fr)" w="100%" gap={0} overflow='hidden'>
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
                  onRun={onRun}
                  saveState={saveState} />
        }
      </GridItem>

      {/* Editor */}
      <GridItem colSpan={isTerminalOpen ? 5 : 8}>
        <Flex>
          <Box><Divider orientation="vertical"/></Box>
          {loaded &&
          <CodeEditor file={files[openIdx]} onEdit={onEdit}/>
          }
          <Box><Divider orientation="vertical"/></Box>
        </Flex>
      </GridItem>

      {/* Terminal */}
      {loaded && isTerminalOpen &&
      <GridItem colSpan={3}>
        <Terminal token={token}
                  projectId={id}
                  lastRun={lastRun}
                  onClose={() => setIsTerminalOpen(false)} />
      </GridItem>}
    </Grid>
  )
}