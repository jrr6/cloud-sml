import React, { useEffect, useRef, useState } from 'react'
import * as Xterm from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { AttachAddon } from 'xterm-addon-attach'
import '../styles/xterm.css'
import '../styles/xterm-tweaks.css'
import { Box, CloseButton, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { CODE_FONTS } from '../util/Fonts'
import { fetchOrLogin } from '../util/FetchTools'
import { useHistory } from 'react-router-dom'

type TerminalProps = { token: string, projectId: string, lastRun: Date | null, onClose: () => void }

export const Terminal: React.FC<TerminalProps> = ({ token, projectId, lastRun, onClose }) => {
  const terminalDivRef: React.RefObject<HTMLDivElement> = useRef(null)
  // Abuse refs because we don't want to deal with re-renders
  const terminalRef = useRef<Xterm.Terminal | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const showTerminalError = () => { terminalRef.current!.write('\r\n\n\x1b[31;1mTerminal disconnected\x1b[0m\r\n\n') }
  const [showCloseButton, setShowCloseButton] = useState(false)
  const { colorMode } = useColorMode()
  const history = useHistory()

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
      fontSize: 14
    } as Xterm.ITerminalOptions)

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(terminalDivRef.current!)
    fitAddon.fit()

    fetchOrLogin(`http://${window.location.hostname}:3001/run`, {
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
    }, history).then(res => res.json())
      .then(({ pid }) => {
        const socket = new WebSocket(`ws://${window.location.hostname}:3001/terminals/${pid}`)
        socket.onclose = showTerminalError
        socket.onerror = showTerminalError
        socket.onopen = () => {
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

  useEffect(() => {
    terminalRef.current?.setOption('theme', theme)
  }, [colorMode])

  return (
    <Box onMouseEnter={() => setShowCloseButton(true)}
         onMouseLeave={() => setShowCloseButton(false)}
         style={{width: '100%', height: '100%'}}>
      <CloseButton size='lg'
                   position='fixed'
                   right={4} top={4} zIndex={10}
                   opacity={showCloseButton ? '100' : '0'}
                   onClick={() => onClose()} />
      <div ref={terminalDivRef} style={{width: '100%', height: '100%'}} />
    </Box>
  )
}