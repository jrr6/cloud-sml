import React from "react"
import Editor from "@monaco-editor/react"
import { fallbackLanguage } from "../monaco-config/sml-fallback-language"
import { useColorMode, useColorModeValue } from '@chakra-ui/react'
import { ProjectFile } from '../../../server/src/models/Project'
import { CODE_FONTS } from '../util/Fonts'
import { wasmSupported } from '../util/wasmUtil'
import { loadWASM } from 'onigasm'
import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from 'monaco-editor-textmate'
import smlGrammar from '../monaco-config/sml.tmLanguage.json'
import darkTheme from '../monaco-config/theme-dark.json'
import lightTheme from '../monaco-config/theme-light.json'

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

  const useWasm = wasmSupported()

  return (
    <>
    <ColorChangerDummy refresh={colorChanger} />
    <Editor
      height="100vh"
      path={name}
      defaultLanguage="sml"
      defaultValue={contents}
      options={{tabSize: 2, fontFamily: CODE_FONTS, fontSize: 14}}
      beforeMount={monaco => {
        // Add SML as a language that VS Code recognizes support
        monaco.languages.register({id: "sml"})

        if (useWasm) {
          //@ts-ignore apparently TS doesn't like JSON
          monaco.editor.defineTheme('sml-cloud-dark', darkTheme)
          //@ts-ignore apparently TS doesn't like JSON
          monaco.editor.defineTheme('sml-cloud-light', lightTheme)
        } else {
          // language IS IMonarchLanguage, I just can't figure out how to import the types...
          // @ts-ignore
          monaco.languages.setMonarchTokensProvider("sml", fallbackLanguage)
        }
      }}
      onMount={(editor, monaco) => {
        // Add ability to toggle dark/light appearance
        editor.addAction({
          id: "change-appearance",
          label: "Change Color Theme",
          run: () => {
            setColorChanger(true)
          }
        })

        if (useWasm) {
          loadWASM('http://localhost:8081/resources/onigasm.wasm')
            .then(() => {
              const registry = new Registry({
                getGrammarDefinition: async (scopeName: string) => {
                  // scopeName === source.ml, since there's only one
                  return {
                    format: 'json',
                    content: smlGrammar
                  }
                }
              })

              const grammars = new Map()
              grammars.set('sml', 'source.ml')

              const _ = wireTmGrammars(monaco, registry, grammars, editor)
            })
        }
      }}
      onChange={(newContents, _) => onEdit(newContents || "")}
      // TODO: use fallback vs themes if no wasm
      theme={useColorModeValue(useWasm ? 'sml-cloud-light' : 'vs', useWasm ? 'sml-cloud-dark' : 'vs-dark')}
    />
    </>
  )
}