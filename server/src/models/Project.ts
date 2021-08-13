import { Schema, model } from 'mongoose'

export type ProjectFile = {
  name: string,
  contents: string,
  active: boolean
}

export type NoIdProject = {
  name: string,
  modificationDate: Date,
  creationDate: Date,
  openIdx: number
  files: ProjectFile[]
}

const projectSchema = new Schema<NoIdProject>({
  files: { type: Array, required: true }
})

export type Project = NoIdProject & { _id: string }

export const ProjectModel = model<Project>('Project', projectSchema)
