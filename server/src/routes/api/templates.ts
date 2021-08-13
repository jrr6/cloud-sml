import { router } from '../../server'
import { verifyJWT } from './isAuthenticated'
import { ProjectTemplateModel } from '../../models/ProjectTemplate'

export const registerTemplatesHandler = () => {
  router.get('/templates', verifyJWT, async (req, res) => {
    try {
      const templates = await ProjectTemplateModel.find()
      res.status(200).json({ message: 'Success', templates: templates })
    } catch {
      res.status(500).json({ message: 'Failed to fetch projects' })
    }
  })
}