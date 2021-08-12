import { Schema, model } from 'mongoose'

export type NoIdUser = {
  username: string
  password: string,
  projectIds: string[]
}

const userSchema = new Schema<NoIdUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  projectIds: { type: Array, required: true }
})

export type User = NoIdUser & { _id: string }

export const UserModel = model<User>('User', userSchema)
