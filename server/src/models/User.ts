import { Schema, model } from 'mongoose'

export type Project = {
  name: string,
  modificationDate: Date,
  creationDate: Date,
  workspaceId: string
}

export type NoIdUser = {
  username: string
  password: string,
  projects: Project[]
}

const userSchema = new Schema<NoIdUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  projects: { type: Array, required: true }
})

export type User = NoIdUser & { _id: string }

export const UserModel = model<User>('User', userSchema)
