import React from "react"
import Editor from "@monaco-editor/react"
import { language } from "../monaco-config/sml-language"
import { useColorMode, useColorModeValue } from '@chakra-ui/react'
import { ProjectFile } from '../types/projectTypes'

type CodeEditorProps = {
  file: ProjectFile,
  onEdit: (newContents: string) => any
}

export const CodeEditor: React.FC<CodeEditorProps> = ({onEdit, file: { name, contents }}) => {
  const [colorChanger, setColorChanger] = React.useState(false)

  // This is a terrible approach...but none of the good ones will work
  // (can't call toggleColorMode as action.run b/c doesn't update after the initial color change)
  const ColorChangerDummy: React.FC<{refresh: boolean}> = ({ refresh }) => {
    const { toggleColorMode } = useColorMode()
    React.useEffect(() => { if (refresh) { toggleColorMode(); setColorChanger(false) }}, [])
    return (<></>)
  }

  return (
    <>
    <ColorChangerDummy refresh={colorChanger} />
    <Editor
      height="100vh"
      path={name}
      defaultLanguage="sml"
      defaultValue={contents}
      options={{tabSize: 2}}
      onMount={(editor, monaco) => {
        // Add SML language support
        monaco.languages.register({ id: "sml" })
        // language IS IMonarchLanguage, I just can't figure out how to import the types...
        // @ts-ignore
        monaco.languages.setMonarchTokensProvider("sml", language)

        // Add ability to toggle dark/light appearance
        editor.addAction({
          id: "change-appearance",
          label: "Change Color Theme",
          run: () => { setColorChanger(true) }
        })
      }}
      onChange={(newContents, _) => onEdit(newContents || "")}
      theme={useColorModeValue("vs", "vs-dark")}
    />
    </>
  )
}