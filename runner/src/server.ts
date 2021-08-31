import express, { Express, Request } from 'express'
import { json, urlencoded } from 'body-parser'
import expressWs from 'express-ws'
import { IPty, spawn } from 'node-pty'
import cors from 'cors'
import fetch from 'node-fetch'
import { Project } from '../../server/src/models/Project'
import * as fs from 'fs'
import {
  KillTerminalRequest,
  ProjectQuery,
  TerminalSizeQuery,
  TerminalStats,
  TerminalStatsResponse
} from './types/RunnerTypes'
import { JWTResponse } from '../../server/src/types/serverTypes'

const app: Express = express()
app.use(
  urlencoded({
    extended: false
  })
)
app.use(json())
app.use(cors()) // TODO: remove once all set up
expressWs(app)

type TerminalEntry = { ipty: IPty, processId: string, dir: string }

let terminals: {[key: number]: TerminalEntry} = {},
    logs: {[key: number]: string} = {}

const TERMINAL_KILL_TIMEOUT_MS = 3000

const saveTerminal = (terminal: IPty, processId: string, dir: string) => {
  terminals[terminal.pid] = {
    ipty: terminal,
    processId,
    dir,
  }
  logs[terminal.pid] = ''
  terminal.onData((data: string) => {
    logs[terminal.pid] += data
  })
  return terminal.pid
}
const fetchTerminal = (pid: number): IPty | undefined => terminals[pid]?.ipty
const killTerminal = (pid: number): void => {
  // The terminal may already have been killed by user, so use optional chaining
  terminals[pid]?.ipty.kill('SIGTERM')
  // It gets a window to try to gracefully exit (and save rlwrap history); otherwise, we force-kill
  setTimeout(() => terminals[pid]?.ipty.kill(), TERMINAL_KILL_TIMEOUT_MS)
}
const fetchLogs = (pid: number): string => logs[pid]
const updateTerminalSize = (pid: number, rows: number, cols: number) => {
  terminals[pid].ipty.resize(cols, rows)
}
// Removes a previously active terminal
// Do not call directly -- instead trigger by killing the appropriate terminal
const removeTerminal = (pid: number) => {
  delete terminals[pid]
  delete logs[pid]
  console.log('Closed terminal ' + pid.toString())
}

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

const getUserInfo = async (token: string): Promise<JWTResponse | undefined> => {
  const resp = await fetch('http://server:8081/api/isAuthenticated', {
    method: 'GET',
    headers: {
      'x-access-token': token
    }
  })
  return (await resp.json())
}

const verifyAdmin = async (token: string) => {
  const json = await getUserInfo(token)
  return json?.username === 'admin'
}

app.get('/stats', async (req, res) => {
  try {
    const isAdmin = await verifyAdmin(req.headers['x-access-token'] as string)
    if (isAdmin) {
      const terminalStats: TerminalStats[] = Object.keys(terminals).map(pidStr => {
        const pid = parseInt(pidStr)
        const entry = terminals[pid]
        return {
          pid,
          projectId: entry.processId,
          dir: entry.dir
        }
      })
      return res.status(200).json({
        message: 'Success',
        terminals: terminalStats
      } as TerminalStatsResponse)
    } else {
      return res.status(401).json({ message: 'Not authorized to view stats' })
    }
  } catch {
    return res.status(500).json({ message: 'Error gathering stats' })
  }
})

app.post('/kill', async (req, res) => {
  const isAdmin = await verifyAdmin(req.headers['x-access-token'] as string)
  if (isAdmin) {
    const pid = (req.body as KillTerminalRequest).pid
    killTerminal(pid)
    res.status(200).json({ message: 'Success' })
  } else {
    res.status(401).json({ message: 'Not authorized to kill terminals' })
  }
})

app.post('/run', async (req, res) => {
  const { cols, rows, projectId } = req.body as TerminalSizeQuery & ProjectQuery
  const token = req.headers['x-access-token'] as string
  console.log('Attempting to load project ' + projectId)
  const url = new URL('http://server:8081/api/project')
  const params = {projectId}
  url.search = new URLSearchParams(params).toString()
  try {
    // The server automatically verifies that we're allowed to fetch this project via JWT,
    // so no need for us to manually verify
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
      return res.status(401).json({message: 'Unable to load project'})
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
    env['CLOUDSML_PROJECT_ID'] = projectId
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
      removeTerminal(pid)
    })

    const pid = saveTerminal(term, projectId, env.PWD)
    console.log('Created terminal with PID ' + pid.toString())
    res.status(200).json({
      message: 'Success',
      pid: pid
    })
  } catch (e) {
    console.log('Project load error: ', e)
    res.status(500).json({message: 'Error loading project'})
  }
})

// If we end up doing this, make sure to check JWT upon accessing :pid route to ensure they
// have write access (store JWT with terminal store)
// app.post('/terminals/:pid/size', (req, res) => {
//   try {
//     const pid: number = parseInt(req.params.pid)
//     const query: TerminalSizeQuery = req.query as TerminalSizeQuery
//     updateTerminalSize(pid, parseInt(query.cols) || 80, parseInt(query.rows) || 24)
//   } catch {
//     res.status(400).json({ message: 'Illegal query' })
//   }
// })

//@ts-ignore not sure why expressWs types aren't being picked up
app.ws('/terminals/:pid', async (ws: WebSocket, req: Request) => {
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

  const generateErrorText = (text: string) => `\r\n\x1b[1;37;41m${text}\x1b[0m\r\n`

  try {
    const pid = parseInt(req.params.pid)
    const send = buffer(ws, 5)
    const term: IPty | undefined = fetchTerminal(pid)

    if (term === undefined) {
      // Requested terminal doesn't exist
      ws.send(generateErrorText('Terminal connection failure'))
      console.log('Terminal connection failure for pid ' + pid)
      return
    }
    console.log(`Connected to terminal ${pid}`)
    ws.send(fetchLogs(pid))
    term.onData((data: string) => {
      try {
        send(data)
      } catch { /* ignore */ }
    })
    term.onExit(() => ws.close())
    //@ts-ignore figure out what type ws actually is
    ws.on('message', (msg: string) => {
      term.write(msg)
    })
    //@ts-ignore figure out what type ws actually is
    ws.on('close', () => {
      killTerminal(pid)
    })
  } catch {
    ws.send(generateErrorText('Unknown terminal failure'))
    console.log('Unknown terminal error for pid ' + req.params.pid)
    try {
      const pid = parseInt(req.params.pid)
      killTerminal(pid)
    } catch {
      console.log('\tUnable to kill terminal process ' + req.params.pid)
    }
    return
  }
})

app.listen(3001, () => { console.log('Runner listening on port 3001') })