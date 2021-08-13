import { User } from '../models/User'
import { ProjectTemplate } from '../models/ProjectTemplate'
import { Project, ProjectFile } from '../models/Project'

export type UserRegistration = Omit<User, 'projects'>
export type RequestUserRecord = Omit<Omit<User, 'password'>, 'projects'>
export type RegistrationResponse = { message: string }
export type LoginResponse = { message: string, token?: string }
export type JWTResponse = { message: string, isLoggedIn: boolean, username?: string }
export type TemplateResponse = { message: string, templates: ProjectTemplate[] }
export type ProjectRequest = { projectId: string }
export type ProjectDescriptor = Omit<Omit<Project, 'files'>, 'creationDate'>
export type ProjectResponse = { message: string, project?: ProjectDescriptor }
export type CloneTemplateRequest = { templateId: string }
export type CloneTemplateResponse = { message: string }
export type UploadTemplateRequest = { name: string, files: ProjectFile[] }
export type UploadTemplateResponse = { message: string, templateId: string }
export type ProjectsResponse = { message: string, projects?: Project[] }
export type ChangePasswordRequest = { oldPassword: string, newPassword: string }
export type ChangePasswordResponse = { message: string }
export type SaveFileRequest = { projectId: string, fileIdx: number, newContents: string }
export type SaveFileResponse = { message: string }
export type SetOpenFileRequest = { projectId: string, fileIdx: number }
export type SetOpenFileResponse = { message: string }