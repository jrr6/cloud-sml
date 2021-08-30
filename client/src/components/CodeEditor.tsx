import React from "react"
import Editor from "@monaco-editor/react"
import { fallbackLanguage } from "../monaco-config/sml-fallback-language"
import { useColorMode, useColorModeValue } from '@chakra-ui/react'
import { ProjectFile } from '../../../server/src/models/Project'
import { CODE_FONTS } from '../util/Fonts'
import { wasmSupported } from '../util/wasmUtil'
import smlGrammar from '../monaco-config/sml.tmLanguage.json'
import smlConfiguration from '../monaco-config/sml-configuration.json'
import darkTheme from '../monaco-config/theme-dark.json'
import lightTheme from '../monaco-config/theme-light.json'
import darkThemeBasis from '../monaco-config/theme-dark-basis.json'
import lightThemeBasis from '../monaco-config/theme-light-basis.json'
import { createCompletions } from '../monaco-config/completions'

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {createOnigScanner, createOnigString, loadWASM} from 'vscode-oniguruma'
import {
  ScopeName,
  ScopeNameInfo,
  SimpleLanguageInfoProvider,
  TextMateGrammar
} from '../monaco-config/monaco-tm/providers'
import { LanguageId, registerLanguages } from '../monaco-config/monaco-tm/register'
import {rehydrateRegexps} from '../monaco-config/monaco-tm/configuration'
import { loadVSCodeOnigurumWASM } from '../monaco-config/monaco-tm/utils'

type CodeEditorProps = {
  file: ProjectFile,
  onEdit: (newContents: string) => any
}

export const CodeEditor: React.FC<CodeEditorProps> = ({onEdit, file: { name, contents }}) => {
  const [colorChanger, setColorChanger] = React.useState(false)
  const providerRef = React.useRef<SimpleLanguageInfoProvider>()

  // TODO: exiting and then re-entering the editor kills the color changer
  // (so theme changes made on the Dashboard after leaving and before re-entering, or even changes made
  // *within* the editor after leaving and re-entering, don't update the syntax colors correctly)

  // This is a terrible approach...but none of the good ones will work
  // (can't call toggleColorMode as action.run b/c doesn't update after the initial color change)
  const ColorChangerDummy: React.FC<{refresh: boolean}> = ({ refresh }) => {
    const colorModeObj = useColorMode()
    const { toggleColorMode } = colorModeObj
    React.useEffect(() => {
      if (refresh) {
        toggleColorMode()
        setColorChanger(false)
      }
    }, [])
    return (<></>)
  }
  const useWasm = wasmSupported()
  const isLight = useColorMode().colorMode === 'light'

  React.useEffect(() => {
    // No-op on the first run, but if color changes in future this will make sure syntax updates too
    // (regardless of who triggered the change)
    providerRef.current?.setTheme(isLight ? lightTheme : darkTheme)
    providerRef.current?.injectCSS()
  }, [isLight])
  // Ensure that when view is unloaded, we reset CSS injector element (can't return in above effect
  // b/c will reset injector on each color change)
  // Note that the seemingly pointless currying is actually necessary b/c this effect is called
  // *before* providerRef is populated, so we need to wait to grab the reference at call-time
  React.useEffect(() => () => { providerRef.current?.resetCSSInjection() }, [])

  return (
    <>
    <ColorChangerDummy refresh={colorChanger} />
    <Editor
      height="100vh"
      path={name}
      defaultLanguage="sml"
      defaultValue={contents}
      options={{
        tabSize: 2,
        fontFamily: CODE_FONTS,
        fontSize: 14,
        minimap: {enabled: false},
        rulers: [80]
      }}
      // TODO: move the configuration to a useMonaco or loader.init call beforehand
      beforeMount={(monaco) => (async () => {
        //@ts-ignore apparently TS doesn't like JSON
        monaco.editor.defineTheme('sml-cloud-dark', darkThemeBasis)
        //@ts-ignore apparently TS doesn't like JSON
        monaco.editor.defineTheme('sml-cloud-light', lightThemeBasis)
        if (!useWasm) {
          monaco.languages.register({id: 'sml'})
          // language IS IMonarchLanguage, I just can't figure out how to import the types...
          // @ts-ignore
          monaco.languages.setMonarchTokensProvider('sml', fallbackLanguage)
          return
        }
        const languages: monaco.languages.ILanguageExtensionPoint[] = [
          {
            id: 'sml',
            extensions: [
              '.sml',
              '.fun',
              '.sig'
            ],
            aliases: ['SML', 'sml'],
            filenames: []
          },
        ]
        const grammars: {[scopeName: string]: ScopeNameInfo} = {
          'source.sml': {
            language: 'sml',
          }
        }
        // We'll cheat b/c it's always SML
        const fetchGrammar = (_: ScopeName): Promise<TextMateGrammar> => Promise.resolve({
          type: 'json',
          grammar: JSON.stringify(smlGrammar)
        })
        const fetchConfiguration = (_: LanguageId): Promise<monaco.languages.LanguageConfiguration> =>
          Promise.resolve(rehydrateRegexps(JSON.stringify(smlConfiguration)))

        const data: ArrayBuffer | Response = await loadVSCodeOnigurumWASM()
        await loadWASM(data)
        const onigLib = Promise.resolve({
          createOnigScanner,
          createOnigString
        })

        const provider = new SimpleLanguageInfoProvider({
          grammars,
          fetchGrammar,
          configurations: languages.map((language) => language.id),
          fetchConfiguration,
          theme: isLight ? lightTheme : darkTheme,
          onigLib,
          monaco
        })
        providerRef.current = provider
        await registerLanguages(
          languages,
          (language: LanguageId) => provider.fetchLanguageInfo(language),
          monaco
        )
        monaco.languages.registerCompletionItemProvider('sml', {
          provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position)
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            }
            return {
              suggestions: createCompletions(monaco, range)
            }
          }
        })
      })()}
      onMount={(editor, monaco) => {
        // Add ability to toggle dark/light appearance
        editor.addAction({
          id: "change-appearance",
          label: "Change Color Theme",
          run: () => {
            setColorChanger(true)
          }
        })
        // Since beforeMount is async, the provider might not be configured yet
        const tryInjection = () => {
          if (providerRef.current) {
            providerRef.current.injectCSS()
          } else {
            setTimeout(tryInjection, 100)
          }
        }
        tryInjection()
      }}
      onChange={(newContents, _) => onEdit(newContents || "")}
      theme={useColorModeValue(useWasm ? 'sml-cloud-light' : 'vs', useWasm ? 'sml-cloud-dark' : 'vs-dark')}
    />
    </>
  )
}