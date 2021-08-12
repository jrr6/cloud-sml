import express, { Express, RequestHandler } from 'express'
import cors from 'cors'
import { json, urlencoded } from 'body-parser'
import { connect } from 'mongoose'
import { NoIdUser, User, UserModel } from './User'
import { compare, hash } from 'bcrypt'
import { sign, verify } from 'jsonwebtoken'

const app: Express = express()

app.use(
  urlencoded({
    extended: false
  })
)
app.use(json())
app.use(cors()) // TODO: delete this once we serve the website

const DB_URI: string = 'mongodb://root:sDTxh0i2iNR_!8kleSF@127.0.0.1:27017/cloudsml?authSource=admin'


connect(DB_URI, { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Failed to connect to MongoDB with error: ' + err))

// TODO: Move register route to own file in routes/
const SALT_ROUNDS = 10
type UserRegistration = Omit<NoIdUser, 'projectIds'>
type RegistrationResponse = { message: string }
app.post('/register', async (req, res) => {
  const user: UserRegistration = req.body
  const isDuplicate = await UserModel.findOne({ username: user.username })
  if (isDuplicate) {
    return res.status(400).json({ message: 'Account with specified username already exists.' })
  } else {
    const newPassword = await hash(user.password, SALT_ROUNDS)
    const newUser = new UserModel({
      username: req.body.username,
      password: newPassword,
      projectIds: []
    })
    await newUser.save()
    return res.status(200).json({ message: 'Success' })
  }
})

// TODO: Move login to own file in routes/
// Converts a JWT function to a promise
// TODO: we can make the promise type more specific by extracting the type from the function
const promisify: (_ : Function) => (..._: any[]) => Promise<any> = (jwtFun : Function) => (...args: any[]) => new Promise((res, rej) => {
  jwtFun(...args, (jwtErr : Error | null, jwtRes : string | undefined) =>
    jwtErr === null ? res(jwtRes) : rej(jwtErr)
  )
})
const TOKEN_EXPIRATION_TIME_SEC = 60 * 60 * 24
const JWT_SIGNING_KEY = 'i4QhE*5RIQcKqueP!ptlNGnx&CFQs4RhI*X$7D8f4^6KsBqH!o0dEN0WeM*CvX6&lRH^tRVD0&MgolR0#aT3UOhFY897W0lE2^4h'
app.post('/login', async (req, res) => {
  const submittedUser: UserRegistration = req.body
  const registeredUser: User | null = await UserModel.findOne({ username: submittedUser.username })
  if (registeredUser === null) {
    return res.status(404).json({
      message: 'Invalid username or password'
    })
  }

  const isPasswordCorrect = await compare(submittedUser.password, registeredUser.password)
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: 'Invalid username or password' })
  }

  const jwtPayload = {
    id: registeredUser._id,
    username: registeredUser.username
  }
  try {
    const token: string = await promisify(sign)(jwtPayload, JWT_SIGNING_KEY, { expiresIn: TOKEN_EXPIRATION_TIME_SEC })
    return res.json({ message: 'Success', token: 'Bearer ' + token })
  } catch {
    return res.status(400).json({ message: 'Invalid username or password' })
  }
})

type JWTResponse = { message: string, isLoggedIn: boolean }
const verifyJWT: RequestHandler = (req, res, next) => {
  const tokenHeader = req.headers['x-access-token'] as string | undefined
  const token = tokenHeader?.split(' ')[1]
  if (token === undefined) {
    return res.status(400).json({ message: 'Invalid token', isLoggedIn: false })
  }
  promisify(verify)(token, JWT_SIGNING_KEY)
    .then(decoded => {
      req.user = {
        _id: decoded._id,
        username: decoded.username
      }
      next()
    })
    .catch(_ => res.status(400).json({
      message: 'Invalid token',
      isLoggedIn: false
    }))
}

app.get('/testEndpoint', verifyJWT, (req, res) => {
  res.status(200).json({ message: 'Logged in', isLoggedIn: true, username: req.user!.username })
})

// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
// });

app.listen(8081, () => console.log('Server is running on http://localhost:8081/'))