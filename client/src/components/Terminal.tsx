import React, { useEffect, useRef } from 'react'
import * as Xterm from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { AttachAddon } from 'xterm-addon-attach'
import '../util/xterm.css'

type TerminalProps = { token: string, projectId: string }

export const Terminal: React.FC<TerminalProps> = ({ token, projectId }) => {
  const terminalDivRef: React.RefObject<HTMLDivElement> = useRef(null)
  // Abuse refs because we don't want to deal with re-renders
  const terminalRef: React.RefObject<{terminal?: Xterm.Terminal}> = useRef({ terminal: undefined })
  const showTerminalError = () => { terminalRef.current!.terminal!.write('\n\n\x1b[31mCONNECTION LOST\n\n') }

  useEffect(() => {
    const term = new Xterm.Terminal({
      windowsMode: false,
      fontFamily: 'Fira Code, SF Mono, monospace'
    } as Xterm.ITerminalOptions)

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(terminalDivRef.current!)
    fitAddon.fit()

    fetch('http://localhost:3001/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cols: term.cols,
        rows: term.rows,
        token,
        projectId
      })
    }).then((res) => {
      res.json().then(({ pid }) => {
        const socket = new WebSocket(`ws://localhost:3001/terminals/${pid}`)
        socket.onclose = showTerminalError
        socket.onerror = showTerminalError
        socket.onopen = () => { console.log('socket connected'); term.loadAddon(new AttachAddon(socket)) }
      })
    })
    terminalRef.current!.terminal = term
    return () => {
      terminalRef.current!.terminal!.dispose()
    }
  }, [])


  return (
    <div ref={terminalDivRef} style={{width: '100%', height: '100%'}} />
  )
}