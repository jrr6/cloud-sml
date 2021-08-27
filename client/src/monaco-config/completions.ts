
//@ts-ignore I really need to figure out how to import Monaco types
export const createCompletions = (monaco, range) => [
  {
    label: 'local',
    kind: monaco.languages.CompletionItemKind.Snippet,
    documentation: 'local declaration',
    insertText: 'local\n\t${1:bindings}\nin\n\t${2:declarations}\nend',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range
  },
  {
    label: 'let',
    kind: monaco.languages.CompletionItemKind.Snippet,
    documentation: 'let expression',
    insertText: 'let\n\t${1:bindings}\nin\n\t${2:expression}\nend',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range
  },
  {
    label: 'case',
    kind: monaco.languages.CompletionItemKind.Snippet,
    documentation: 'case expression',
    insertText: '(case ${1:expression} of\n\t${2:pattern1} => ${3:body1}\n| ${4:pattern2} => ${5:body2})',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range
  },
  {
    label: 'fun',
    kind: monaco.languages.CompletionItemKind.Snippet,
    documentation: 'fun declaration',
    insertText: 'fun ${1:name} ${2:arg} = ${3:body}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range
  }
]