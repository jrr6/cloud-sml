import { NoIdUser, Project } from '../models/User'
import { ProjectTemplate } from '../models/ProjectTemplate'
import { ProjectFile } from '../../../client/src/types/projectTypes'

export type UserRegistration = Omit<NoIdUser, 'projects'>
export type RegistrationResponse = { message: string }
export type LoginResponse = { message: string, token?: string }
export type JWTResponse = { message: string, isLoggedIn: boolean, username?: string }
export type TemplateResponse = { message: string, templates: ProjectTemplate[] }
export type WorkspaceRequest = { workspaceId: string }
export type CloneTemplateRequest = { templateId: string }
export type CloneTemplateResponse = { message: string, newProject?: Project }
export type UploadTemplateRequest = { name: string, files: ProjectFile[] }
export type UploadTemplateResponse = { message: string, templateId: string }