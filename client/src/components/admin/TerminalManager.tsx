import React, { useEffect, useState } from 'react'
import { Heading, IconButton, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { IoMdExit } from 'react-icons/all'
import { KillTerminalRequest, TerminalStats, TerminalStatsResponse } from '../../../../runner/src/types/RunnerTypes'
import { LookupProjectsRequest, LookupProjectsResponse } from '../../../../server/src/types/serverTypes'

type AugmentedTerminalStats = TerminalStats & {projectName: string, ownerName: string}

type TerminalManagerProps = { token: string }
export const TerminalManager: React.FC<TerminalManagerProps> = ({ token }) => {
  const [entries, setEntries] = useState<AugmentedTerminalStats[]>([])
  useEffect(() => {
    fetch('http://localhost:3001/stats', {
      method: 'GET',
      headers: {
        'x-access-token': token
      }
    }).then(res => res.json())
      .then(async (json: TerminalStatsResponse) => {
        // Once we have the terminals, we need to look up the associated user/project info for each
        const lookupRes = await fetch('/api/lookupProjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          },
          body: JSON.stringify({
            projectIds: json.terminals.map(stats => stats.projectId)
          } as LookupProjectsRequest)
        })
        const lookupJson: LookupProjectsResponse = await lookupRes.json()
        const projectsInfo = lookupJson.projectDescriptions.map(desc => ({ projectName: desc.name, ownerName: desc.ownerName }))
        return json.terminals.map((term, idx) => ({
          ...term,
          projectName: projectsInfo[idx].projectName,
          ownerName: projectsInfo[idx].ownerName
        }))
      }).then((newEntries: AugmentedTerminalStats[]) => setEntries(newEntries))
  }, [])

  const killTerminal = (pid: number) => () => {
    fetch('http://localhost:3001/kill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      body: JSON.stringify({
        pid
      } as KillTerminalRequest)
    }).then(() => { window.location.reload() })
  }

  // TODO: lookup user and name for project (somehow?)
  const terminalRows = entries.map(({ pid, projectId, projectName, ownerName, dir }) => (
    <Tr key={pid}>
      <Td>{ownerName}</Td>
      <Td>{projectName} ({projectId})</Td>
      <Td>{dir}</Td>
      <Td>{pid}</Td>
      <Td><IconButton aria-label='kill'
                      colorScheme='red'
                      size='xs'
                      icon={<IoMdExit />}
                      onClick={killTerminal(pid)} /></Td>
    </Tr>
  ))

  return (
    <>
      <Heading size='lg' as='h3' marginBottom={5}>Active Terminals</Heading>
      <Table variant='simple' size='sm'>
        <Thead>
          <Tr>
            <Th>User</Th>
            <Th>Project</Th>
            <Th>Directory</Th>
            <Th>PID</Th>
            <Th>Kill</Th>
          </Tr>
        </Thead>
        <Tbody>
          {terminalRows.length === 0
            ? <Tr><Td colSpan={5} textAlign='center' border='none'>No active terminals</Td></Tr>
            : terminalRows}
        </Tbody>
      </Table>
    </>
  )
}