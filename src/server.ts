import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import express, { Request } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { version } from '../package.json'
import { isDevEnv } from './config'
import { registerAuth, v1Router } from './controllers'
import { logger } from './core/utils'
import { initDatabase } from './dataAccess'
import { testRouter } from './__tests__/integration'

dotenv.config()

const FILE_SIZE_LIMIT_MB = 50

export async function makeServer(port: number, sessionSecret: string) {
  try {
    const app = express()

    if (!isDevEnv) {
      app.use(
        helmet({
          // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
          // Only send refererer for same origin and transport (HTTPS->HTTPS)
          referrerPolicy: { policy: 'strict-origin' },
          hsts: {
            maxAge: 63072000,
            includeSubDomains: false,
            preload: true,
          },
          contentSecurityPolicy: {
            directives: {
              'default-src': ["'self'", 'metabase.potentiel.beta.gouv.fr'],
              'connect-src': ["'self'", "'unsafe-inline'"],
              'img-src': ["'self'", 'data:'],
              'style-src': ["'self'", 'data:', "'unsafe-inline'"],
              'script-src': ["'unsafe-inline'", "'self'", 'metabase.potentiel.beta.gouv.fr'],
              'object-src': ["'none'"],
            },
          },
        })
      )
    }

    app.use(
      morgan('tiny', {
        skip: (req: Request, res) =>
          req.path.startsWith('/fonts') ||
          req.path.startsWith('/css') ||
          req.path.startsWith('/images') ||
          req.path.startsWith('/scripts') ||
          req.path.startsWith('/main') ||
          req.path === '/',
      })
    )

    app.use(
      express.urlencoded({
        extended: false,
        limit: FILE_SIZE_LIMIT_MB + 'mb',
      })
    )
    app.use(express.json({ limit: FILE_SIZE_LIMIT_MB + 'mb' }))

    app.use(cookieParser())

    registerAuth({ app, sessionSecret })

    app.use(v1Router)

    app.use(express.static('src/public'))

    if (process.env.NODE_ENV === 'test') {
      app.use(testRouter)
    }

    app.use((error, req, res, next) => {
      logger.error(error)

      res
        .status(500)
        .send(
          'Une erreur inattendue est survenue. Veuillez nous excuser pour la gêne occasionée. Merci de réessayer et de contacter l‘équipe si le problème persiste.'
        )
    })

    // wait for the database to initialize
    await initDatabase()

    return new Promise((resolve) => {
      const server = app.listen(port, () => {
        logger.info(`Server listening on port ${port}!`)
        logger.info(`NODE_ENV is ${process.env.NODE_ENV}`)
        logger.info(`Version ${version}`)
        resolve(server)
      })
    })
  } catch (error) {
    logger.error(error)
  }
}

export * from './dataAccess'
