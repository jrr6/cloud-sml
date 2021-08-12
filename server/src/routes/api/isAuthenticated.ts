import { RequestHandler } from 'express'
import { promisify } from '../../utils/fnUtils'
import { verify } from 'jsonwebtoken'
import { JWT_SIGNING_KEY } from '../../utils/authConfig'
import { router } from '../../server'

export const registerIsAuthenticatedHandler = () => {
  const verifyJWT: RequestHandler = (req, res, next) => {
    const tokenHeader = req.headers['x-access-token'] as string | undefined
    const token = tokenHeader?.split(' ')[1]
    if (token === undefined) {
      return res.status(401).json({ message: 'Invalid token', isLoggedIn: false })
    }
    promisify(verify)(token, JWT_SIGNING_KEY)
      .then(decoded => {
        req.user = {
          _id: decoded._id,
          username: decoded.username
        }
        next()
      })
      .catch(_ => res.status(401).json({
        message: 'Invalid token',
        isLoggedIn: false
      }))
  }

  router.get('/isAuthenticated', verifyJWT, (req, res) => {
    res.status(200).json({ message: 'Logged in', isLoggedIn: true, username: req.user!.username })
  })
}

