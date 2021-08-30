import { RequestHandler } from 'express'
import { promisify } from '../../utils/fnUtils'
import { verify } from 'jsonwebtoken'
import { JWT_SIGNING_KEY } from '../../utils/authConfig'
import { router } from '../../server'
import { JWTResponse } from '../../types/serverTypes'

export const INVALID_TOKEN_RESPONSE_CODE = 441
export const verifyJWT: RequestHandler = (req, res, next) => {
  const tokenHeader = req.headers['x-access-token'] as string | undefined
  const token = tokenHeader?.split(' ')[1]
  if (token === undefined) {
    return res.status(INVALID_TOKEN_RESPONSE_CODE).json({ message: 'Invalid token', isLoggedIn: false })
  }
  promisify(verify)(token, JWT_SIGNING_KEY)
    .then(decoded => {
      req.user = {
        _id: decoded._id,
        username: decoded.username
      }
      next()
    })
    .catch(_ => res.status(INVALID_TOKEN_RESPONSE_CODE).json({
      message: 'Invalid token',
      isLoggedIn: false
    }))
}

export const registerIsAuthenticatedHandler = () => {
  router.get('/isAuthenticated', verifyJWT, (req, res) => {
    res.status(200).json({
      message: 'Logged in',
      isLoggedIn: true,
      username: req.user!.username
    } as JWTResponse)
  })
}

