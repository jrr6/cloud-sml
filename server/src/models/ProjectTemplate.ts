import { Schema, model } from 'mongoose'
import { ProjectFile } from './Project'

export type NoIdProjectTemplate = {
  name: string,
  files: ProjectFile[]
}

const projectTemplateSchema = new Schema<NoIdProjectTemplate>({
  name: { type: String, required: true },
  files: { type: Array, required: true }
})

export type ProjectTemplate = NoIdProjectTemplate & { _id: string }

export const ProjectTemplateModel = model<ProjectTemplate>('ProjectTemplate', projectTemplateSchema)
