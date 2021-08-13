import { router } from '../../server'
import { verifyJWT } from './isAuthenticated'
import JSZip from 'jszip'
import { UserModel } from '../../models/User'
import { Project } from '../../models/Project'

export const registerDownloadFilesHandler = () => {
  router.get('/downloadFiles', verifyJWT, async (req, res) => {
    try {
      const user = await UserModel.findOne({_id: req.user!._id}).populate('projects')
      if (user === null) {
        return res.status(401).json({message: 'User not found'})
      }
      const zip = JSZip()

      // Time tag for generated zip
      const formatter = Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false     // setting 24 hour format
      })
      const formatArr = formatter.formatToParts(new Date())
      const dateTag = formatArr
                        .filter(e => e.type !== 'literal') // throw away their separators
                        .reduce((acc, comp, i) =>
                            i > 2 ? acc + comp.value : acc + comp.value + '-', // hyphenate Y-M-D but not time
                          '')

      const root = zip.folder(`cloud-sml-export_${dateTag}`)!
      for (const project of user.projects as Project[]) {
        const projectFolder = root.folder(project.name)
        for (const file of project.files) {
          projectFolder?.file(file.name, file.contents)
        }
      }
      const zipBase64 = await zip.generateAsync({ type: 'base64' })
      const buffer = Buffer.from(zipBase64, 'base64')
      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Length': buffer.length
      })
      res.end(buffer)
    } catch {
      return res.status(500).json({message: 'Error downloading files'})
    }
  })
}