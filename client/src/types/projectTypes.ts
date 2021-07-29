export type ProjectFile = {
  name: string,
  contents: string,
  active: boolean
}

export type Project = {
  uuid: string,
  name: string,
  modificationDate: Date,
  creationDate: Date,
  files: Array<ProjectFile>,
  openIdx: number
}