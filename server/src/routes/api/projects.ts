import { RequestUserRecord } from '../../types/serverTypes'
import { UserModel } from '../../models/User'
import { router } from '../../server'
import { verifyJWT } from './isAuthenticated'

export const registerProjectsHandler = () => {
  router.get('/projects', verifyJWT, async (req, res) => {
    const user: RequestUserRecord = req.user!
    const projects = (await UserModel.findOne({_id: user._id}))?.projects
    if (projects) {
      return res.status(200).json({
        message: 'Success',
        projects: projects
      })
    } else {
      return res.status(401).json({
        message: 'Could not load projects'
      })
    }
  })
}