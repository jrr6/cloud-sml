import { Schema, model } from 'mongoose'

export type ProjectFile = {
  name: string,
  contents: string,
  active: boolean
}

export type NoIdProject = {
  name: string,
  ownerId: string,
  modificationDate: Date,
  creationDate: Date,
  openIdx: number
  files: ProjectFile[]
}

const projectSchema = new Schema<NoIdProject>({
  name: { type: String, required: true },
  ownerId: { type: String, required: true },
  modificationDate: { type: Date, required: true },
  creationDate: { type: Date, required: true },
  openIdx: { type: Number, required: true },
  files: { type: Array, required: true }
})

export type Project = NoIdProject & { _id: string }

export const ProjectModel = model<Project>('Project', projectSchema)
