import { Schema, model } from 'mongoose'

type File = {
  name: string,
  contents: string,
  enabled: boolean
}

export type NoIdWorkspace = {
  files: File[]
}

const projectSchema = new Schema<NoIdWorkspace>({
  files: { type: Array, required: true }
})

export type Workspace = NoIdWorkspace & { _id: string }

export const WorkspaceModel = model<Workspace>('Workspace', projectSchema)
