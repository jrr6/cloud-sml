import { History } from 'history'

// CRA won't let us import this, but the source of truth is in isAuthenticated.ts
const INVALID_TOKEN_RESPONSE_CODE = 441

// Can't seem to get types for useHistory
export const fetchOrLogin = (url: RequestInfo | URL, options: RequestInit, history: History): Promise<Response> =>
  // URL is a perfectly valid argument to fetch, but TS complains
  fetch(url as RequestInfo, options).then(async (res: Response) => {
    if (res.status === INVALID_TOKEN_RESPONSE_CODE) history.push('/')
    return res
  })