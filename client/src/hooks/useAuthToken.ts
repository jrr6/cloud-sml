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
      localStorage.removeItem('token')
    } else {
      localStorage.setItem('token', userToken)
    }
    setToken(userToken)
  }

  return {
    setToken: saveToken,
    token
  }
}