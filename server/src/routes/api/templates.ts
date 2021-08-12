import { router } from '../../server'
import { verifyJWT } from './isAuthenticated'
import { ProjectTemplateModel } from '../../models/ProjectTemplate'

export const registerTemplatesHandler = () => {
  router.get('/templates', verifyJWT, async (req, res) => {
    const templates = await ProjectTemplateModel.find()
    res.status(200).send({ message: 'Success', templates: templates })
  })
}