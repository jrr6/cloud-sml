import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { AuthToken } from '../types/authTypes'

type PRProps<P> = {
  component: React.ElementType<P>,
  defaultProps?: P,
  token: AuthToken,
  [rest: string]: any
}

//@ts-ignore (it doesn't like the generic P for some reason?)
export const PrivateRoute: React.FC<PRProps<P>> = ({ component: Component, defaultProps, token, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      token ? (
        <Component {...defaultProps} {...props} />
      ) : (
        <Redirect to='/' />
      )
    } />
)