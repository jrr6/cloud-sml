import React from 'react'
import {
  Box,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  List,
  ListIcon,
  ListItem,
  useColorModeValue
} from '@chakra-ui/react'
import { CodeEditor } from './CodeEditor'
import { IoMdDocument } from 'react-icons/all'

export const ProjectView = () => (
  <Grid templateColumns="repeat(10, 1fr)" w="100%" gap={0}>
    {/* File List */}
    <GridItem colSpan={2} p={5}>
      <Heading as="h3" size="md">Polymorphism & Datatypes</Heading>
      <List marginTop={2} spacing={3} w="100%">
        <ListItem w="100%" p={1} cursor="pointer" _hover={{background: useColorModeValue("gray.200", "gray.700")}}>
          <ListIcon as={IoMdDocument} />
          File 1
        </ListItem>
      </List>
    </GridItem>

    {/* Editor */}
    <GridItem colSpan={5}>
      <Flex>
        <Box><Divider orientation="vertical" /></Box>
        <CodeEditor />
        <Box><Divider orientation="vertical" /></Box>
      </Flex>
    </GridItem>

    {/* Terminal */}
    <GridItem colSpan={3}>
      <p>This is where the terminal goes</p>
    </GridItem>
  </Grid>
)