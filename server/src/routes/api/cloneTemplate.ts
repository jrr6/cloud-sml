import { router } from '../../server'
import { verifyJWT } from './isAuthenticated'
import { CloneTemplateRequest } from '../../types/serverTypes'
import { ProjectTemplateModel } from '../../models/ProjectTemplate'
import { Project, UserModel } from '../../models/User'
import { WorkspaceModel } from '../../models/Workspace'

export const registerCloneTemplateHandler = () => {
  router.post('/cloneTemplate', verifyJWT, async (req, res) => {
    const userId = req.user!._id
    const templateId = (req.body as CloneTemplateRequest).templateId
    const templateToClone = await ProjectTemplateModel.findOne({ _id: templateId })
    if (templateToClone === null) {
      return res.status(404).json({
        message: 'Requested template does not exist'
      })
    }

    const workspaceToClone = await WorkspaceModel.findOne({ _id: templateToClone.workspaceId })
    if (workspaceToClone === null) {
      return res.status(401).json({
        message: 'Corrupted template requested'
      })
    }
    const newWorkspace = new WorkspaceModel({
      files: workspaceToClone.files
    })
    const newWorkspaceId: string = (await newWorkspace.save())._id

    const now = new Date()
    const newProject: Project = {
      name: templateToClone.name,
      modificationDate: now,
      creationDate: now,
      workspaceId: newWorkspaceId
    }

    const user = await UserModel.findOne({ _id: userId })
    if (user === null) {
      return res.status(404).json({
        message: 'User does not exist'
      })
    }
    user.projects.push(newProject)
    await user.save()
    res.status(200).json({
      message: 'Success',
      newProject
    })
  })
}