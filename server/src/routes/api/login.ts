import { User, UserModel } from '../../models/User'
import { compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { JWT_SIGNING_KEY, TOKEN_EXPIRATION_TIME_SEC } from '../../utils/authConfig'
import { UserRegistration } from '../../types/serverTypes'
import { promisify } from '../../utils/fnUtils'
import { router } from '../../server'

export const registerLoginHandler = () => {
  router.post('/login', async (req, res) => {
    const submittedUser: UserRegistration = req.body
    const registeredUser: User | null = await UserModel.findOne({ username: submittedUser.username })
    if (registeredUser === null) {
      return res.status(401).json({
        message: 'Invalid username or password'
      })
    }

    const isPasswordCorrect = await compare(submittedUser.password, registeredUser.password)
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid username or password' })
    }

    const jwtPayload = {
      _id: registeredUser._id,
      username: registeredUser.username
    }
    try {
      const token: string = await promisify(sign)(jwtPayload, JWT_SIGNING_KEY, { expiresIn: TOKEN_EXPIRATION_TIME_SEC })
      return res.json({ message: 'Success', token: 'Bearer ' + token })
    } catch {
      return res.status(401).json({ message: 'Invalid username or password' })
    }
  })
}
