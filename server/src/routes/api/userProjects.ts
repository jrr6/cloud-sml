import { RequestUserRecord } from '../../types/serverTypes'
import { UserModel } from '../../models/User'
import { router } from '../../server'
import { verifyJWT } from './isAuthenticated'
import { Project } from '../../models/Project'

export const registerUserProjectsHandler = () => {
  router.get('/userProjects', verifyJWT, async (req, res) => {
    const user: RequestUserRecord = req.user!
    // Populate the project refs in the user document, then map the doc to just those projects
    try {
      const projRes = await UserModel.findOne({_id: user._id}).populate('projects')
        .map(doc => ({
          projects: (doc?.projects as Project[])?.map((proj: Project) => ({
            _id: proj._id,
            name: proj.name,
            modificationDate: proj.modificationDate
          }))
        }))

      if (projRes?.projects) {
        return res.status(200).json({
          message: 'Success',
          projects: projRes!.projects
        })
      } else {
        return res.status(500).json({
          message: 'Error processing projects'
        })
      }
    } catch {
      return res.status(500).json({ message: 'Failed to fetch user projects' })
    }
  })
}