import { router } from '../../server'
import { UploadTemplateRequest } from '../../types/serverTypes'
import { ProjectTemplateModel } from '../../models/ProjectTemplate'
import { WorkspaceModel } from '../../models/Workspace'

export const registerUploadTemplateHandler = () => {
  // TODO: only admin should be able to use this endpoint
  router.post('/uploadTemplate', async (req, res) => {
    const { name, files } = req.body as UploadTemplateRequest
    const newWorkspace = new WorkspaceModel({
      files
    })
    const workspaceId = (await newWorkspace.save())._id

    const newTemplate = new ProjectTemplateModel({
      name,
      workspaceId
    })
    const templateId = (await newTemplate.save())._id
    res.status(200).json({
      message: 'Success',
      templateId
    })
  })
}