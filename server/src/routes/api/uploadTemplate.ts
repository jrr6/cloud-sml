import { router } from '../../server'
import { UploadTemplateRequest } from '../../types/serverTypes'
import { ProjectTemplateModel } from '../../models/ProjectTemplate'

export const registerUploadTemplateHandler = () => {
  // TODO: only admin should be able to use this endpoint
  router.post('/uploadTemplate', async (req, res) => {
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