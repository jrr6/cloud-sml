export type ProjectFile = {
  name: string,
  contents: string,
  active: boolean
}

export type Project = {
  name: string,
  files: Array<ProjectFile>,
  openIdx: number
}