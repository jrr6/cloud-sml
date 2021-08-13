import { router } from '../../server'
import { verifyJWT } from './isAuthenticated'
import { UserModel } from '../../models/User'
import { compare, hash } from 'bcrypt'
import { SALT_ROUNDS } from '../../utils/authConfig'
import { ChangePasswordRequest } from '../../types/serverTypes'

export const registerChangePasswordHandler = () => {
  router.post('/changePassword', verifyJWT, async (req, res) => {
    const userId = req.user!._id
    const reqData: ChangePasswordRequest = req.body
    const registeredUser = await UserModel.findOne({ _id: userId })
    if (registeredUser === null) {
      return res.status(401).json({
        message: 'Invalid user'
      })
    }
    const isPasswordCorrect = await compare(reqData.oldPassword, registeredUser.password)
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Invalid password'
      })
    }
    try {
      registeredUser.password = await hash(reqData.newPassword, SALT_ROUNDS)
      await registeredUser.save()
      res.status(200).json({ message: 'Success' })
    } catch {
      res.status(500).json({ message: 'Failed to save password' })
    }

  })
}