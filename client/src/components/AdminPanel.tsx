import React from 'react'
import { Box, Flex, Grid, Heading } from '@chakra-ui/react'
import { ColorModeSwitcher } from './ColorModeSwitcher'
import { Redirect } from 'react-router-dom'
import { RegistrationForm } from './admin/RegistrationForm'
import { TemplateUploader } from './admin/TemplateUploader'

type AdminPanelProps = {
  token: string,
  loggedInUser: string
}

export enum OperationState {
  NoOp,
  Success,
  Failure
}

// All the things that are too much work to just do through Compass...
export const AdminPanel: React.FC<AdminPanelProps> = ({ token, loggedInUser }) => {
  if (loggedInUser !== 'admin' || token === null) {
    return (<Redirect to='/' />)
  }

  return (
    <Box padding={5}>
      <Flex justifyContent='space-between' borderBottom='1px solid gray' marginBottom={5}>
        <Heading as='h1'>Cloud SML Administrator Console</Heading>
        <ColorModeSwitcher />
      </Flex>
      <Grid templateColumns='repeat(2, 1fr)' gap={5}>
        <Box borderWidth={1} borderRadius={8} boxShadow="lg" padding={5}>
          <RegistrationForm token={token} />
        </Box>
        <Box borderWidth={1} borderRadius={8} boxShadow="lg" padding={5}>
          <TemplateUploader token={token } />
        </Box>
      </Grid>
    </Box>
  )
}