import { Application, response } from 'express'
import makeSequelizeStore from 'connect-session-sequelize'
import session from 'express-session'
import Keycloak from 'keycloak-connect'
import { v4 as uuid } from 'uuid'
import { User, USER_ROLES } from '../../entities'
import { getUserByEmail, registerFirstUserLogin } from '../../config'
import { sequelizeInstance } from '../../sequelize.config'
import { v1Router } from '../v1Router'
import routes from '../../routes'
import { inviteUser } from '../../infra/keycloak'
import { logger } from '../../core/utils'

const SequelizeStore = makeSequelizeStore(session.Store)

const store = new SequelizeStore({
  db: sequelizeInstance,
  tableName: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000, // 15 minutes
  expiration: 24 * 60 * 60 * 1000, // 1 day
})

const {
  KEYCLOAK_SERVER,
  KEYCLOAK_REALM,
  KEYCLOAK_USER_CLIENT_ID,
  KEYCLOAK_USER_CLIENT_SECRET,
} = process.env

if (
  !KEYCLOAK_SERVER ||
  !KEYCLOAK_REALM ||
  !KEYCLOAK_USER_CLIENT_ID ||
  !KEYCLOAK_USER_CLIENT_SECRET
) {
  console.error('Missing KEYCLOAK env vars')
  process.exit(1)
}
export const keycloak = new Keycloak(
  {
    store,
  },
  {
    'confidential-port': 0,
    'auth-server-url': KEYCLOAK_SERVER,
    resource: KEYCLOAK_USER_CLIENT_ID,
    'ssl-required': 'external',
    'bearer-only': false,
    realm: KEYCLOAK_REALM,
    // @ts-ignore
    credentials: {
      secret: KEYCLOAK_USER_CLIENT_SECRET,
    },
  }
)

// Method to be called first
// Sets up passport middleware in the express app
interface RegisterAuthProps {
  app: Application
  sessionSecret: string
}
export const registerAuth = ({ app, sessionSecret }: RegisterAuthProps) => {
  app.use(
    session({
      secret: sessionSecret,
      store,
      resave: false,
      proxy: true,
      saveUninitialized: false,
    })
  )

  app.use(keycloak.middleware())

  // Add a middleware to attach the User object on the request (if logged-in)
  app.use((request, response, next) => {
    if (
      // Theses paths should be prefixed with /static in the future
      request.path.startsWith('/fonts') ||
      request.path.startsWith('/css') ||
      request.path.startsWith('/images') ||
      request.path.startsWith('/scripts') ||
      request.path.startsWith('/main') ||
      request.path === '/'
    ) {
      next()
      return
    }

    // @ts-ignore
    const token = request.kauth?.grant?.access_token
    const userEmail = token?.content?.email
    const kRole = token && USER_ROLES.find((role) => token.hasRealmRole(role))

    if (userEmail && kRole) {
      return getUserByEmail(userEmail).then((userResult) => {
        if (userResult.isOk() && userResult.value !== null) {
          request.user = userResult.value
          request.user.role = kRole
          if (!request.user.isRegistered) {
            registerFirstUserLogin({ userId: userResult.value.id, fullName: '' })
          }
        } else {
          logger.error(
            new Error(`Keycloak session open but could not find user in db with email ${userEmail}`)
          )
        }
        next()
      })
    }

    next()
  })

  v1Router.get(routes.LOGIN, keycloak.protect(), (req, res) => {
    res.redirect(routes.REDIRECT_BASED_ON_ROLE)
  })

  v1Router.get(routes.REDIRECT_BASED_ON_ROLE, keycloak.protect(), async (req, res) => {
    const user = req.user as User

    if (!user) {
      // Sometimes, the user session is not immediately available in the req object
      // In that case, wait a bit and redirect to the same url

      // @ts-ignore
      if (req.kauth && Object.keys(req.kauth).length) {
        // This user has a session but no user was found, log him out
        // res.send('Found kauth but not req.user')
        logger.error(
          `Found user keycloak auth but not user in database for id ${req.kauth?.grant?.access_token?.content?.sub}`
        )
        res.redirect('/logout')
        return
      }

      // Use a retry counter to avoid infinite loop
      const retryCount = Number(req.query.retry || 0)
      if (retryCount > 5) {
        // Too many retries
        return res.redirect('/')
      }
      setTimeout(() => {
        res.redirect(`${routes.REDIRECT_BASED_ON_ROLE}?retry=${retryCount + 1}`)
      }, 200)
      return
    }

    if (['admin', 'dgec', 'dreal'].includes(user.role)) {
      res.redirect(routes.ADMIN_DASHBOARD)
      return
    }

    res.redirect(routes.USER_DASHBOARD)
  })
}

export const ensureRole = (roles: User['role'] | User['role'][]) => {
  const roleList = Array.isArray(roles) ? roles : [roles]

  return keycloak.protect((token) => {
    return roleList.some((role) => token.hasRealmRole(role))
  })
}

export const ensureLoggedIn = keycloak.protect.bind(keycloak)
