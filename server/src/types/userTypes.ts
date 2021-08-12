import { NoIdUser } from '../models/User'

export type UserRegistration = Omit<NoIdUser, 'projects'>
export type RegistrationResponse = { message: string }
export type LoginResponse = { message: string, token?: string }
export type JWTResponse = { message: string, isLoggedIn: boolean, username?: string }