// Converts a JWT function to a promise
// TODO: we can make the promise type more specific by extracting the type from the function
export const promisify: (_ : Function) => (..._: any[]) => Promise<any> = (jwtFun : Function) => (...args: any[]) => new Promise((res, rej) => {
  jwtFun(...args, (jwtErr : Error | null, jwtRes : string | undefined) =>
    jwtErr === null ? res(jwtRes) : rej(jwtErr)
  )
})