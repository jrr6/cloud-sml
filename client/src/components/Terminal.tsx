import React, { useEffect, useRef, useState } from 'react'
import * as Xterm from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { AttachAddon } from 'xterm-addon-attach'
import '../styles/xterm.css'
import '../styles/xterm-tweaks.css'
import { CloseButton, useColorModeValue } from '@chakra-ui/react'
import { CODE_FONTS } from '../util/Fonts'

type TerminalProps = { token: string, projectId: string, lastRun: Date | null, onClose: () => void }

export const Terminal: React.FC<TerminalProps> = ({ token, projectId, lastRun, onClose }) => {
  const terminalDivRef: React.RefObject<HTMLDivElement> = useRef(null)
  // Abuse refs because we don't want to deal with re-renders
  const terminalRef = useRef<Xterm.Terminal | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const showTerminalError = () => { terminalRef.current!.write('\n\n\x1b[31mCONNECTION LOST\x1b[0m\n\n') }
  const [showCloseButton, setShowCloseButton] = useState(false)

  const lightTheme = {
    background: '#fff',
    cursor: '#000',
    foreground: '#000'
  }
  const darkTheme = {
    background: '#000',
    cursor: '#fff',
    foreground: '#fff'
  }

  const theme = useColorModeValue(lightTheme, darkTheme)

  useEffect(() => {
    const term = new Xterm.Terminal({
      windowsMode: false,
      fontFamily: CODE_FONTS,
      fontSize: 14,
      theme
    } as Xterm.ITerminalOptions)

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(terminalDivRef.current!)
    fitAddon.fit()

    fetch('http://localhost:3001/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token
      },
      body: JSON.stringify({
        cols: term.cols,
        rows: term.rows,
        projectId
      })
    }).then(res => res.json())
      .then(({ pid }) => {
        const socket = new WebSocket(`ws://localhost:3001/terminals/${pid}`)
        socket.onclose = showTerminalError
        socket.onerror = showTerminalError
        socket.onopen = () => {
          console.log('socket connected')
          term.loadAddon(new AttachAddon(socket))
        }
        socketRef.current = socket
      })
    terminalRef.current = term
    return () => {
      if (socketRef.current !== null) {
        // Deregister error text function, since we're the ones closing, not (unexpectedly) the server
        socketRef.current.onclose = null
        socketRef.current.close()
      }
      terminalRef.current?.dispose()
    }
  }, [lastRun])

  return (
    <>
      <CloseButton size='lg'
                   position='fixed'
                   right={4} top={4} zIndex={10}
                   opacity={showCloseButton ? '100' : '0'}
                   onMouseEnter={() => setShowCloseButton(true)}
                   onMouseLeave={() => setShowCloseButton(false)}
                   onClick={() => onClose()} />
      <div ref={terminalDivRef} style={{width: '100%', height: '100%'}} />
    </>
  )
}