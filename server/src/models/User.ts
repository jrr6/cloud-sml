import { Schema, model } from 'mongoose'

export type ProjectFile = {
  name: string,
  contents: string,
  active: boolean
}

export type Project = {
  name: string,
  modificationDate: Date,
  creationDate: Date,
  workspaceId: string,
  openIdx: number
}

export type NoIdUser = {
  username: string
  password: string,
  projects: Project[]
}

const userSchema = new Schema<NoIdUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  projects: { type: Array, required: true },
  openIdx: { type: Number, required: true }
})

export type User = NoIdUser & { _id: string }

export const UserModel = model<User>('User', userSchema)
