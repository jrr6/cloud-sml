import { useState} from 'react'
import { AuthToken } from '../types/authTypes'

type TokenOps = {
  auth: {
    token: AuthToken,
    username: string
  },
  setAuth: (token: AuthToken, username?: string) => any,
}

export const useAuthToken = (): TokenOps => {
  const getToken = (): AuthToken => {
    return localStorage.getItem('token');
  }

  const getUsername = (): string => {
    return localStorage.getItem('username') || ''
  }

  const [token, setToken] = useState<AuthToken>(getToken())
  const [username, setUsername] = useState<string>(getUsername())
  const saveToken = (userToken: AuthToken, username?: string) => {
    if (userToken === null) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
    } else {
      localStorage.setItem('token', userToken)
      localStorage.setItem('username', username || '')
    }
    setToken(userToken)
    setUsername(username || '')
  }

  return {
    setAuth: saveToken,
    auth: {
      token,
      username
    }
  }
}