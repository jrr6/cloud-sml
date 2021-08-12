import { Project, ProjectFile, User } from '../models/User'
import { ProjectTemplate } from '../models/ProjectTemplate'
import { Workspace } from '../models/Workspace'

export type UserRegistration = Omit<User, 'projects'>
export type RequestUserRecord = Omit<Omit<User, 'password'>, 'projects'>
export type RegistrationResponse = { message: string }
export type LoginResponse = { message: string, token?: string }
export type JWTResponse = { message: string, isLoggedIn: boolean, username?: string }
export type TemplateResponse = { message: string, templates: ProjectTemplate[] }
export type WorkspaceRequest = { workspaceId: string }
export type WorkspaceResponse = { message: string, workspace?: Workspace }
export type CloneTemplateRequest = { templateId: string }
export type CloneTemplateResponse = { message: string, newProject?: Project }
export type UploadTemplateRequest = { name: string, files: ProjectFile[] }
export type UploadTemplateResponse = { message: string, templateId: string }
export type ProjectsResponse = { message: string, projects?: Project[] }