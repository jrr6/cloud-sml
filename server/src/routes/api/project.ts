import { router } from '../../server'
import { verifyJWT } from './isAuthenticated'
import { ProjectRequest } from '../../types/serverTypes'
import { ProjectModel } from '../../models/Project'

export const registerWorkspaceHandler = () => {
  router.get('/project', verifyJWT, async (req, res) => {
    const project = await ProjectModel.findOne({ _id: (req.query as ProjectRequest).projectId })
    if (project === null) {
      return res.status(404).json({
        message: 'Project not found'
      })
    } else if (project.ownerId !== req.user!._id) {
      return res.status(401).json({
        message: 'Not authorized to access requested project'
      })
    } else {
      return res.status(200).json({
        message: 'Success',
        project: project
      })
    }
  })
}