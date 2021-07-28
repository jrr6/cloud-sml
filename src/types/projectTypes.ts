export type ProjectFile = {
  name: string,
  contents: string,
  active: boolean
}

export type Project = {
  uuid: string,
  name: string,
  files: Array<ProjectFile>,
  openIdx: number
}