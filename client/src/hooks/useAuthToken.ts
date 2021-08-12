import { useState} from 'react'
import { AuthToken } from '../types/authTypes'

type TokenOps = {
  token: AuthToken,
  setToken: (token: AuthToken) => any
}

export const useAuthToken = (): TokenOps => {
  const getToken = (): AuthToken => {
    return localStorage.getItem('token');
  }

  const [token, setToken] = useState<AuthToken>(getToken())
  const saveToken = (userToken: AuthToken) => {
    if (userToken === null) {
      console.log('empty token')
      localStorage.removeItem('token')
    } else {
      localStorage.setItem('token', userToken)
      console.log('token set')
    }
    setToken(JSON.stringify(userToken))
  }

  return {
    setToken: saveToken,
    token
  }
}