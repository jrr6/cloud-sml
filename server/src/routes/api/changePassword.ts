import { router } from '../../server'
import { verifyJWT } from './isAuthenticated'
import { NoIdUser, UserModel } from '../../models/User'
import { compare, hash } from 'bcrypt'
import { SALT_ROUNDS } from '../../utils/authConfig'
import { ChangePasswordRequest } from '../../types/serverTypes'

export const registerChangePasswordHandler = () => {
  router.post('/changePassword', verifyJWT, async (req, res) => {
    const reqData: ChangePasswordRequest = req.body
    let registeredUser

    const checkValidUser = (registeredUser: NoIdUser | null) => {
      if (registeredUser === null) {
        res.status(404).json({
          message: 'Invalid user'
        })
        return false
      }
      return true
    }

    if (reqData.adminForUser !== undefined) {
      // Verify that submitter is admin and verify requested user exists
      if (req.user!.username !== 'admin') {
        return res.status(401).json(({
          message: 'Not authorized to change passwords'
        }))
      }
      registeredUser = await UserModel.findOne({ username: reqData.adminForUser })
      if (!checkValidUser(registeredUser)) return
    } else if (reqData.oldPassword !== undefined) {
      // Verify submitting user still exists and that password matches
      registeredUser = await UserModel.findOne({ _id: req.user!._id })
      if (!checkValidUser(registeredUser)) return
      const isPasswordCorrect = await compare(reqData.oldPassword, registeredUser!.password)
      if (!isPasswordCorrect) {
        return res.status(401).json({
          message: 'Invalid password'
        })
      }
    } else {
      // Someone submitted a malformed request
      return res.status(400).json({
        message: 'Invalid password change request'
      })
    }

    try {
      registeredUser!.password = await hash(reqData.newPassword, SALT_ROUNDS)
      await registeredUser!.save()
      return res.status(200).json({ message: 'Success' })
    } catch {
      return res.status(500).json({ message: 'Failed to save password' })
    }

  })
}