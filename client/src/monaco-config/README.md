# Themes

Themes can be added in one of two ways (method 2 seems to work better?):

1. Pull `.json` VS Code themes from VS Code extensions (for instance, `~/.vscode/extensions/zhuangtongfa.material-theme-3.11.4/themes/OneDark-Pro-flat.json`). Then run, e.g., `npx monaco-vscode-textmate-theme-converter -i ~/Downloads/OneDark-Pro-flat.json -o themes/dark.json` to convert the VS Code JSON to Monaco JSON.
2. Find a `.tmTheme` file online, e.g., on https://tmtheme-editor.herokuapp.com/. (Some good ones seem to include Calydon and Apple Pips, though the latter is a bit lacking in contrast. Beware of some of these themes' strange practice of making keywords and types the same color.) Then use https://bitwiser.in/monaco-themes/ to convert the `tmTheme` plist into a Monaco JSON file.

Current theme is [RoRvsWild](https://www.rorvswild.com/theme).

# Language Grammars

To generate the language grammar JSON file, pull the TextMate grammar file (e.g., https://github.com/textmate/standard-ml.tmbundle/blob/master/Syntaxes/Standard%20ML.plist) and then use `plutil -convert json grammar.plist -o sml.tmLanguage.json` to generate a JSON version.