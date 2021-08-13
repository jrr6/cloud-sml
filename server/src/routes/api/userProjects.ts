//@ts-nocheck
import { RequestUserRecord } from '../../types/serverTypes'
import { UserModel } from '../../models/User'
import { router } from '../../server'
import { verifyJWT } from './isAuthenticated'
import { ProjectModel } from '../../models/Project'

export const registerUserProjectsHandler = () => {
  router.get('/userProjects', verifyJWT, async (req, res) => {
    const user: RequestUserRecord = req.user!
    // Populate the project refs in the user document, then map the doc to just those projects
    const projRes = await UserModel.findOne({_id: user._id}).populate('projects')
    // FIXME
    //   .map(doc => ({
    //   projects: doc?.projects.map(proj => ({
    //     _id: proj._id,
    //     name: proj.name,
    //     modificationDate: proj.modificationDate
    //   }))
    // }))
    if (projRes?.projects) {
      return res.status(200).json({
        message: 'Success',
        projects: projRes!.projects
      })
    } else {
      return res.status(401).json({
        message: 'Could not load projects'
      })
    }
  })
}