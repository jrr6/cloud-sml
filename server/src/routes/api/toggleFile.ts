import { router } from '../../server'
import { verifyJWT } from './isAuthenticated'
import { ToggleFileRequest } from '../../types/serverTypes'
import { ProjectModel } from '../../models/Project'

export const registerToggleFileHandler = () => {
  router.post('/toggleFile', verifyJWT, async (req, res) => {
    const reqData: ToggleFileRequest = req.body
    const project = await ProjectModel.findOne({ _id: reqData.projectId })
    if (project === null) {
      return res.status(404).json({
        message: 'Project not found'
      })
    } else if (project.ownerId !== req.user!._id) {
      return res.status(401).json({
        message: 'Not authorized to write to project'
      })
    }

    // Update the active state
    project.files[reqData.fileIdx].active = reqData.active
    project.markModified('files')

    try {
      await project.save()
      return res.status(200).json({ message: 'Success' })
    } catch {
      return res.status(500).json({ message: 'Failed to write file' })
    }

  })
}