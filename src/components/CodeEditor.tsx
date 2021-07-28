import React from "react"
import Editor from "@monaco-editor/react"
import { language } from "../monaco-config/sml-language"
import { useColorModeValue } from '@chakra-ui/react'
import { ProjectFile } from '../types/projectTypes'

type CodeEditorProps = {
  file: ProjectFile,
  onEdit: (newContents: string) => any
}

export const CodeEditor: React.FC<CodeEditorProps> = ({onEdit, file: { name, contents }}) => (
  <Editor
    height="100vh"
    path={name}
    defaultLanguage="sml"
    defaultValue={contents}
    options={{tabSize: 2}}
    onMount={(editor, monaco) => {
      monaco.languages.register({ id: "sml" })
      // language IS IMonarchLanguage, I just can't figure out how to import the types...
      // @ts-ignore
      monaco.languages.setMonarchTokensProvider("sml", language)
    }}
    onChange={(newContents, _) => onEdit(newContents || "")}
    theme={useColorModeValue("vs", "vs-dark")}
  />
)