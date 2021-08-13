import express, { Express, Router } from 'express'
import * as path from 'path'
import cors from 'cors'
import { json, urlencoded } from 'body-parser'
import { connect } from 'mongoose'
import { DB_URI } from './utils/authConfig'
import { registerLoginHandler } from './routes/api/login'
import { registerRegisterHandler } from './routes/api/register'
import { registerIsAuthenticatedHandler } from './routes/api/isAuthenticated'
import { registerTemplatesHandler } from './routes/api/templates'
import { registerWorkspaceHandler } from './routes/api/project'
import { registerUploadTemplateHandler } from './routes/api/uploadTemplate'
import { registerCloneTemplateHandler } from './routes/api/cloneTemplate'
import { registerUserProjectsHandler } from './routes/api/userProjects'
import { registerChangePasswordHandler } from './routes/api/changePassword'
import { registerDownloadFilesHandler } from './routes/api/downloadFiles'

const app: Express = express()
export const router = Router()

app.use(
  urlencoded({
    extended: false
  })
)
app.use(json())
app.use(cors()) // TODO: delete this once we serve the website

connect(DB_URI, { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Failed to connect to MongoDB with error: ' + err))

// Register route handlers
registerLoginHandler()
registerRegisterHandler()
registerIsAuthenticatedHandler()
registerTemplatesHandler()
registerWorkspaceHandler()
registerCloneTemplateHandler()
registerUploadTemplateHandler()
registerUserProjectsHandler()
registerChangePasswordHandler()
registerDownloadFilesHandler()

app.use('/api', router)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
})

app.listen(8081, () => console.log('Server is running on http://localhost:8081/'))