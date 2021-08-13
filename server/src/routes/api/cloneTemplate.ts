import { router } from '../../server'
import { verifyJWT } from './isAuthenticated'
import { CloneTemplateRequest } from '../../types/serverTypes'
import { ProjectTemplateModel } from '../../models/ProjectTemplate'
import { UserModel } from '../../models/User'
import { ProjectModel } from '../../models/Project'

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

    const now = new Date()
    const newProject = new ProjectModel({
      name: templateToClone.name,
      modificationDate: now,
      creationDate: now,
      openIdx: 0,
      files: templateToClone.files
    })
    console.log(newProject)
    const newProjectId = (await newProject.save())._id

    const user = await UserModel.findOne({ _id: userId })
    if (user === null) {
      return res.status(404).json({
        message: 'User does not exist'
      })
    }
    user.projects.push(newProjectId)
    await user.save()
    res.status(200).json({
      message: 'Success'
    })
  })
}