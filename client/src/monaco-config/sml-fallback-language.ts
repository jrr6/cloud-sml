// some useful discussion: https://github.com/react-monaco-editor/react-monaco-editor/issues/136

export const fallbackLanguage = {
  keywords: [
    'EQUAL', 'GREATER', 'LESS', 'NONE', 'SOME', 'abstraction', 'abstype', 'and', 'andalso', 'array', 'as', 'before', 'bool', 'case', 'char', 'datatype', 'do', 'else', 'end', 'eqtype', 'exception', 'exn', 'false', 'fn', 'fun', 'functor', 'handle', 'if', 'in', 'include', 'infix', 'infixr', 'int', 'let', 'list', 'local', 'nil', 'nonfix', 'not', 'o', 'of', 'op', 'open', 'option', 'orelse', 'overload', 'print', 'raise', 'real', 'rec', 'ref', 'sharing', 'sig', 'signature', 'string', 'struct', 'structure', 'substring', 'then', 'true', 'type', 'unit', 'val', 'vector', 'where', 'while', 'with', 'withtype', 'word'
  ],

  typeKeywords: [ 'bool', 'char', 'int', 'list', 'string', 'unit', 'vector' ],

  operators: [
    '=', '>', '<', '!', '~', '<=', '>=', '<>',
    '+', '-', '*', '/', '!', '::'
  ],

  brackets:  [ ['{','}','delimiter.curly'],
    ['[',']','delimiter.square'],
    ['(',')','delimiter.parenthesis'] ],

  escapes :  /\\(?:[nrt\\"'\?]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{6})/,
  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  tokenizer: {
    root: [
      // identifiers and keywords
      [/[a-z_$][\w$]*/, { cases: { '@typeKeywords': 'keyword',
          '@keywords': 'keyword',
          '@default': 'identifier' } }],
      [/[A-Z][\w\$]*/, 'type.identifier' ],

      // whitespace
      { include: '@whitespace' },

      // delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [/@symbols/, { cases: { '@operators': 'operator',
          '@default'  : '' } } ],

      // numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],

      // delimiter: after number because of .\d floats
      [/[;,.]/, 'delimiter'],

      // strings
      [/"([^"\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
      [/"/,  { token: 'string.quote', bracket: '@open', next: '@string' } ],

      // characters
      [/#"[^\\']"/, 'string'],
      [/(#")(@escapes)(")/, ['string','string.escape','string']],
      [/#"/, 'string.invalid']
    ],

    comment: [
      [/[^\*\)]+/, 'comment' ],
      // [/\(\*/,    'comment', '@push' ],    // nested comment -- we don't want these!
      [/\*\)/,    'comment', '@pop'  ], // alternative: "\\*\\)"
      [/[\)*]+/, 'comment' ]
    ],

    string: [
      [/[^\\"]+/,  'string'],
      [/@escapes/, 'string.escape'],
      [/\\./,      'string.escape.invalid'],
      [/"/,        { token: 'string.quote', bracket: '@close', next: '@pop' } ]
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\(\*/,       'comment', '@comment' ]
    ]
  }
}
