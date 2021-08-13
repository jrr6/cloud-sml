import { router } from '../../server'
import { verifyJWT } from './isAuthenticated'
import { ProjectModel } from '../../models/Project'
import { SaveFileRequest } from '../../types/serverTypes'

export const registerSaveFileHandler = () => {
  router.post('/saveFile', verifyJWT, async (req, res) => {
    // Fetch project and verify user has write privileges
    const reqData: SaveFileRequest = req.body
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

    // Update the contents
    project.files[reqData.fileIdx].contents = reqData.newContents
    project.markModified('files') // mongoose doesn't detect nested changes

    // Update the modificationDate
    project.modificationDate = new Date()

    try {
      await project.save()
      return res.status(200).json({ message: 'Success' })
    } catch {
      return res.status(500).json({ message: 'Failed to write file' })
    }
  })
}