import express, { Express, Request } from 'express'
import { json, urlencoded } from 'body-parser'
import expressWs from 'express-ws'
import { IPty, spawn } from 'node-pty'
import cors from 'cors'
import fetch from 'node-fetch'
import { Project } from '../../server/src/models/Project'
import * as fs from 'fs'

const app: Express = express()
app.use(
  urlencoded({
    extended: false
  })
)
app.use(json())
app.use(cors()) // TODO: remove once all set up
expressWs(app)

// TODO: this info (along with who's using which terminal) should be accessible (and killable) from admin dashboard
let terminals: {[key: number]: IPty} = {},
    logs: {[key: number]: string} = {}

const saveTerminal = (terminal: IPty) => {
  terminals[terminal.pid] = terminal
  logs[terminal.pid] = ''
  terminal.onData((data: string) => {
    logs[terminal.pid] += data
  })
  return terminal.pid
}
const fetchTerminal = (pid: number): IPty | undefined => terminals[pid]
const fetchLogs = (pid: number): string => logs[pid]
const updateTerminalSize = (pid: number, rows: number, cols: number) => {
  terminals[pid].resize(cols, rows)
}
const removeTerminal = (pid: number) => {
  terminals[pid].kill()
  delete terminals[pid]
  delete logs[pid]
  console.log('Closed terminal ' + pid.toString())
}

type TerminalSizeQuery = { cols: string, rows: string }
type AuthQuery = { token: string, projectId: string }

const RUNS_PATH_PREFIX = '/runs'

const generateDirname = (projectId: string): string => {
  const RANDOM_DIGITS = 7
  const rand = Math.floor(Math.random() * Math.pow(10, RANDOM_DIGITS))
  const candidate = `${projectId}_${rand}`
  if (fs.existsSync(`${RUNS_PATH_PREFIX}/${candidate}`)) {
    return generateDirname(projectId)
  } else {
    return candidate
  }
}

app.post('/run', async (req, res) => {
  const { cols, rows, token, projectId } = req.body as TerminalSizeQuery & AuthQuery
  console.log('Attempting to load project ' + projectId)
  // TODO: requester needs to ensure that project has first been saved
  const url = new URL('http://host.docker.internal:8081/api/project')
  const params = {projectId}
  url.search = new URLSearchParams(params).toString()
  try {
    const fetchRes = await fetch(url, {
      method: 'GET',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json'
      }
    })
    const resJson = await fetchRes.json()
    const project: Project = resJson.project
    if (!project) {
      res.status(401).json({message: 'Unable to load project'})
      return
    }
    const activeFiles = project.files.filter(file => file.active)
    const dirname = generateDirname(projectId)
    const dirpath = `${RUNS_PATH_PREFIX}/${dirname}`
    fs.mkdirSync(dirpath)
    activeFiles.forEach(f => {
      fs.writeFileSync(`${dirpath}/${f.name}`, f.contents)
    })
    const filenames = activeFiles.map(f => f.name)

    const env = Object.assign({}, process.env)
    env.PWD = dirpath
    env['COLORTERM'] = 'truecolor'
    const term = spawn('smlnj', filenames, {
      name: 'xterm-256color',
      cols: parseInt(cols) || 80,
      rows: parseInt(rows) || 24,
      cwd: env.PWD,
      //@ts-ignore this is directly from their sample code
      env: env,
      encoding: null
    })
    term.onExit(() => {
      // Delete run container on exit
      fs.rmSync(dirpath, { recursive: true, force: true })
    })
    const pid = saveTerminal(term)
    console.log('Created terminal with PID ' + pid.toString())
    res.status(200).json({
      message: 'Success',
      pid: pid
    })
  } catch (e) {
    console.log('!!!! Project load error: ', e)
    res.status(500).json({message: 'Error loading project'})
  }
})

// TODO: Check JWT upon accessing :pid route to ensure they have write access (store JWT with terminal store)
app.post('/terminals/:pid/size', (req, res) => {
  try {
    const pid: number = parseInt(req.params.pid)
    const query: TerminalSizeQuery = req.query as TerminalSizeQuery
    updateTerminalSize(pid, parseInt(query.cols) || 80, parseInt(query.rows) || 24)
  } catch {
    res.status(400).json({ message: 'Illegal query' })
  }
})

//@ts-ignore not sure why expressWs types aren't being picked up
app.ws('/terminals/:pid', (ws: WebSocket, req: Request) => {
  const buffer = (socket: WebSocket, timeout: number) => {
    let buffer: any[] = []
    let sender: NodeJS.Timeout | null = null
    let length = 0
    return (data: any) => {
      buffer.push(data)
      length += data.length
      if (!sender) {
        sender = setTimeout(() => {
          socket.send(Buffer.concat(buffer, length))
          buffer = []
          sender = null
          length = 0
        }, timeout)
      }
    }
  }

  try {
    const pid = parseInt(req.params.pid)
    const send = buffer(ws, 5)
    const term: IPty | undefined = fetchTerminal(pid)
    if (term === undefined) {
      // TODO: something
      console.log('Terminal connection failure for pid ' + pid)
      return
    }
    console.log(`Connected to terminal ${pid}`)
    ws.send(fetchLogs(pid))
    term.onData((data: string) => {
      try {
        send(data)
      } catch {
        // ignore
      }
    })
    //@ts-ignore figure out what type ws actually is
    ws.on('message', (msg: string) => {
      term.write(msg)
    })
    //@ts-ignore figure out what type ws actually is
    ws.on('close', () => {
      removeTerminal(pid)
    })
  } catch {
    // TODO: something
  }
})

app.listen(3001, () => { console.log('Runner listening on port 3001') })