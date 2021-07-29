import { useState} from 'react'
import { AuthToken } from '../types/authTypes'

type TokenOps = {
  token: AuthToken | undefined,
  setToken: (token: AuthToken | undefined) => any
}

export const useAuthToken = (): TokenOps => {
  const getToken = (): AuthToken | undefined => {
    const tokenString = localStorage.getItem('token');
    if (tokenString !== null) {
      const userToken = JSON.parse(tokenString);
      return userToken?.token
    } else {
      return undefined
    }
  }

  const [token, setToken] = useState<AuthToken | undefined>(getToken())
  const saveToken = (userToken: AuthToken | undefined) => {
    if (userToken === undefined) {
      localStorage.removeItem('token')
    } else {
      localStorage.setItem('token', JSON.stringify(userToken))
    }
    setToken(userToken)
  }

  return {
    setToken: saveToken,
    token
  }
}