import { Schema, model } from 'mongoose'

export type NoIdProjectTemplate = {
  name: string,
  workspaceId: string
}

const projectTemplateSchema = new Schema<NoIdProjectTemplate>({
  name: { type: String, required: true },
  workspaceId: { type: String, required: true }
})

export type ProjectTemplate = NoIdProjectTemplate & { _id: string }

export const ProjectTemplateModel = model<ProjectTemplate>('ProjectTemplate', projectTemplateSchema)
