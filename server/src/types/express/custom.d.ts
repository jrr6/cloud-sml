import { RequestUserRecord } from '../serverTypes'

// Hacky workaround to allow extending the req object
// See https://stackoverflow.com/a/58788706/3650805
declare global {
  declare namespace Express {
    interface Request {
      user?: RequestUserRecord
    }
  }
}