import { router } from '../../server'
import { verifyJWT } from './isAuthenticated'
import { WorkspaceRequest } from '../../types/serverTypes'
import { WorkspaceModel } from '../../models/Workspace'

export const registerWorkspaceHandler = () => {
  router.get('/workspace', verifyJWT, async (req, res) => {
    const id = (req.query as WorkspaceRequest).workspaceId
    const workspace = await WorkspaceModel.findOne({ _id: id })
    if (workspace === null) {
      return res.status(404).json({
        message: 'Workspace not found'
      })
    } else {
      return res.status(200).json({
        message: 'Success',
        workspace: workspace
      })
    }
  })
}