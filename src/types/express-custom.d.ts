import { User } from '../entities'

declare module 'express-serve-static-core' {
  // eslint-disable-next-line
  interface Request {
    user: User
    kauth: any
  }
}
