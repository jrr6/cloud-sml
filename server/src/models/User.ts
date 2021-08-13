import { Schema, model, PopulatedDoc } from 'mongoose'
import { Project } from './Project'

export type NoIdUser = {
  username: string
  password: string,
  projects: PopulatedDoc<Project>[]
}

const userSchema = new Schema<NoIdUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
})

export type User = NoIdUser & { _id: string }

export const UserModel = model<User>('User', userSchema)
