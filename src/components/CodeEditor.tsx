import React from "react"
import Editor from "@monaco-editor/react"
import { language } from "../monaco-config/sml-language"

export const CodeEditor = () => (
  <Editor
    height="100vh"
    defaultLanguage="sml"
    defaultValue="(* Functions are values! *)"
    options={{tabSize: 2}}
    onMount={(editor, monaco) => {
      monaco.languages.register({ id: "sml" })
      // language IS IMonarchLanguage, I just can't figure out how to import the types...
      // @ts-ignore
      monaco.languages.setMonarchTokensProvider("sml", language)
    }}
  />
)