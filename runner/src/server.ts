import express, { Express, Request } from 'express'
import expressWs from 'express-ws'
import { IPty, spawn } from 'node-pty'
import cors from 'cors'

const app: Express = express()
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

app.post('/spawn', (req, res) => {
  const query: TerminalSizeQuery = req.query as TerminalSizeQuery
  const env = Object.assign({}, process.env)
  env['COLORTERM'] = 'truecolor'
  const term = spawn('smlnj', [], {
    name: 'xterm-256color',
    cols: parseInt(query.cols) || 80,
    rows: parseInt(query.rows) || 24,
    cwd: env.PWD,
    //@ts-ignore this is directly from their sample code
    env: env,
    encoding: null
  })
  const pid = saveTerminal(term)
  console.log('Created terminal with PID ' + pid.toString())
  res.status(200).json({
    message: 'Success',
    pid: pid
  })
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
      console.log('terminal connection failure')
      return
    }
    console.log(`connected to terminal ${pid}`)
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