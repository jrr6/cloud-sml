import { router } from '../../server'
import { verifyJWT } from './isAuthenticated'
import { LookupProjectsRequest, LookupProjectsResponse } from '../../types/serverTypes'
import { ProjectModel } from '../../models/Project'
import { UserModel } from '../../models/User'

export const registerLookupProjectsHandler = () => {
  router.post('/lookupProjects', verifyJWT, async (req, res) => {
    if (req.user!.username !== 'admin') {
      return res.status(401).json(({
        message: 'Not authorized to look up projects'
      }))
    }
    const projectIds = (req.body as LookupProjectsRequest).projectIds
    const queryRes = await ProjectModel.find({ _id: { $in: projectIds } })
    const projectDescriptions = await Promise.all (queryRes.map(async proj => {
      const owner = await UserModel.findOne({_id: proj.ownerId})
      const ownerName = owner!.username // TODO: fail gracefully
      return {
        _id: proj._id,
        name: proj.name,
        modificationDate: proj.modificationDate,
        creationDate: proj.creationDate,
        ownerId: proj.ownerId,
        ownerName
      }
    }))
    res.status(200).json({
      message: 'Success',
      projectDescriptions
    } as LookupProjectsResponse)
  })
}