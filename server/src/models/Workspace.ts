import { Schema, model } from 'mongoose'
import { ProjectFile } from './User'

export type NoIdWorkspace = {
  files: ProjectFile[]
}

const projectSchema = new Schema<NoIdWorkspace>({
  files: { type: Array, required: true }
})

export type Workspace = NoIdWorkspace & { _id: string }

export const WorkspaceModel = model<Workspace>('Workspace', projectSchema)
