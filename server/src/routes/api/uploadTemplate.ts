import { router } from '../../server'
import { UploadTemplateRequest } from '../../types/serverTypes'
import { ProjectTemplateModel } from '../../models/ProjectTemplate'
import { verifyJWT } from './isAuthenticated'

export const registerUploadTemplateHandler = () => {
  router.post('/uploadTemplate', verifyJWT, async (req, res) => {
    if (req.user?.username !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to upload templates' })
    }
    const { name, files } = req.body as UploadTemplateRequest

    const newTemplate = new ProjectTemplateModel({
      name,
      files
    })

    try {
      const templateId = (await newTemplate.save())._id
      return res.status(200).json({
        message: 'Success',
        templateId
      })
    } catch {
      return res.status(500).json({ message: 'Failed to save template' })
    }
  })
}