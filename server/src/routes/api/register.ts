import { UserRegistration } from '../../types/serverTypes'
import { UserModel } from '../../models/User'
import { hash } from 'bcrypt'
import { SALT_ROUNDS } from '../../utils/authConfig'
import { router } from '../../server'

export const registerRegisterHandler = () => {
  router.post('/register', async (req, res) => {
    // TODO: use JWT middleware to ensure only admin account can register new users
    const user: UserRegistration = req.body
    const isDuplicate = await UserModel.findOne({ username: user.username })
    if (isDuplicate) {
      return res.status(401).json({ message: 'Account with specified username already exists.' })
    } else {
      const newPassword = await hash(user.password, SALT_ROUNDS)
      const newUser = new UserModel({
        username: req.body.username,
        password: newPassword,
        projects: []
      })
      try {
        await newUser.save()
        return res.status(200).json({message: 'Success'})
      } catch {
        return res.status(500).json({message: 'Failed to register user'})
      }
    }
  })
}