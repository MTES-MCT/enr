import express from 'express'
import multer from 'multer'
import session from 'express-session'
import bodyParser from 'body-parser'

import { version } from '../package.json'

import dotenv from 'dotenv'
dotenv.config()

import makeExpressCallback from './helpers/makeExpressCallback'
import {
  getLoginPage,
  getAdminDashboardPage,
  getAdminRequestsPage,
  getImportProjectsPage,
  getNotifyCandidatesPage,
  getUserDashboardPage,
  registerAuth,
  postLogin,
  ensureLoggedIn,
  logoutMiddleware,
  postProjects,
  postSendCandidateNotifications,
  getSignupPage,
  postSignup,
  getDemandePage,
  postRequestModification,
  getUserRequestsPage,
  getSendCopyOfCandidateNotification,
  getCandidateCertificate,
  getForgottenPasswordPage,
  postRetrievePassword,
  getResetPasswordPage,
  postResetPassword,
  getProjectFile,
  getProjectPage,
  postInviteUserToProject,
  postGarantiesFinancieres,
  getDrealPage,
  postInviteDreal,
  getGarantiesFinancieresPage,
} from './controllers'

import {
  resetDbForTests,
  addProjectsForTests,
  getSentEmailsForTests,
  createInvitationForTests,
  checkUserAccessToProjectForTests,
  createUserWithEmailForTests,
  getProjectIdForTests,
  getProjectHistoryForTests,
  addUserToDrealForTests,
} from './__tests__/integration'

import { initDatabase } from './dataAccess'

import ROUTES from './routes'
import { User } from './entities'

export async function makeServer(port: number = 3000) {
  try {
    const app = express()

    const upload = multer({
      dest: 'temp',
      limits: { fileSize: 10 * 1024 * 1024 /* 10MB */ },
    })

    app.use(express.static('src/public'))
    app.use(session({ secret: 'SD7654fsddxc34fsdfsd7è"("SKSRBIOP6FDFf' }))

    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    registerAuth({
      app,
      loginRoute: ROUTES.LOGIN,
      successRoute: ROUTES.REDIRECT_BASED_ON_ROLE,
    })

    const router = express.Router()

    const ensureRole = (roles: string | Array<string>) => (req, res, next) => {
      const user = req.user as User

      if (!user) {
        return res.redirect(ROUTES.LOGIN)
      }

      if (typeof roles === 'string') {
        if (user.role !== roles) {
          return res.redirect(ROUTES.REDIRECT_BASED_ON_ROLE)
        }
      } else {
        if (!roles.includes(user.role)) {
          return res.redirect(ROUTES.REDIRECT_BASED_ON_ROLE)
        }
      }

      // Ok to move forward
      next()
    }

    router.get(ROUTES.REDIRECT_BASED_ON_ROLE, ensureLoggedIn(), (req, res) => {
      const user = req.user as User

      if (user.role === 'admin' || user.role === 'dgec') {
        res.redirect(ROUTES.ADMIN_DASHBOARD)
      }

      if (user.role === 'dreal') {
        res.redirect(ROUTES.GARANTIES_FINANCIERES_LIST)
      }

      if (user.role === 'porteur-projet') {
        res.redirect(ROUTES.USER_DASHBOARD)
      }
    })

    router.get(ROUTES.LOGIN, makeExpressCallback(getLoginPage))

    router.post(ROUTES.LOGIN_ACTION, postLogin()) // No makeExpressCallback as this uses a middleware
    router.get(ROUTES.LOGOUT_ACTION, logoutMiddleware, (req, res) => {
      res.redirect('/')
    })

    router.get(
      ROUTES.FORGOTTEN_PASSWORD,
      makeExpressCallback(getForgottenPasswordPage)
    )
    router.post(
      ROUTES.FORGOTTEN_PASSWORD_ACTION,
      makeExpressCallback(postRetrievePassword)
    )
    router.get(
      ROUTES.RESET_PASSWORD_LINK(),
      makeExpressCallback(getResetPasswordPage)
    )
    router.post(
      ROUTES.RESET_PASSWORD_ACTION,
      makeExpressCallback(postResetPassword)
    )

    router.get(
      ROUTES.ADMIN_DASHBOARD,
      ensureLoggedIn(),
      ensureRole(['admin', 'dgec', 'dreal']),
      makeExpressCallback(getAdminDashboardPage)
    )

    router.get(
      ROUTES.ADMIN_LIST_REQUESTS,
      ensureLoggedIn(),
      ensureRole(['admin', 'dgec']),
      makeExpressCallback(getAdminRequestsPage)
    )

    router.get(
      ROUTES.IMPORT_PROJECTS,
      ensureLoggedIn(),
      ensureRole(['admin', 'dgec']),
      makeExpressCallback(getImportProjectsPage)
    )

    router.post(
      ROUTES.IMPORT_PROJECTS_ACTION,
      ensureLoggedIn(),
      ensureRole(['admin', 'dgec']),
      upload.single('candidats'),
      makeExpressCallback(postProjects)
    )

    router.get(
      ROUTES.ADMIN_SEND_COPY_OF_CANDIDATE_NOTIFICATION_ACTION(),
      ensureRole(['admin', 'dgec']),
      makeExpressCallback(getSendCopyOfCandidateNotification)
    )

    router.get(
      ROUTES.ADMIN_NOTIFY_CANDIDATES(),
      ensureLoggedIn(),
      ensureRole(['admin', 'dgec']),
      makeExpressCallback(getNotifyCandidatesPage)
    )

    router.post(
      ROUTES.ADMIN_NOTIFY_CANDIDATES_ACTION,
      ensureLoggedIn(),
      ensureRole(['admin', 'dgec']),
      makeExpressCallback(postSendCandidateNotifications)
    )

    router.get(
      ROUTES.PROJECT_DETAILS(),
      ensureLoggedIn(),
      makeExpressCallback(getProjectPage)
    )

    // Going to the signup page automatically logs you out
    router.get(
      ROUTES.SIGNUP,
      /*logoutMiddleware,*/ makeExpressCallback(getSignupPage)
    )

    router.post(ROUTES.SIGNUP_ACTION, makeExpressCallback(postSignup))

    router.get(
      ROUTES.USER_DASHBOARD,
      ensureLoggedIn(),
      ensureRole('porteur-projet'),
      makeExpressCallback(getUserDashboardPage)
    )

    router.get(
      ROUTES.DEMANDE_GENERIQUE,
      ensureLoggedIn(),
      ensureRole('porteur-projet'),
      makeExpressCallback(getDemandePage)
    )

    router.post(
      ROUTES.DEMANDE_ACTION,
      ensureLoggedIn(),
      ensureRole('porteur-projet'),
      upload.single('file'),
      makeExpressCallback(postRequestModification)
    )

    router.get(
      ROUTES.USER_LIST_DEMANDES,
      ensureLoggedIn(),
      ensureRole('porteur-projet'),
      makeExpressCallback(getUserRequestsPage)
    )

    router.get(
      ROUTES.CANDIDATE_CERTIFICATE(),
      ensureLoggedIn(),
      makeExpressCallback(getCandidateCertificate)
    )

    router.get(
      ROUTES.DOWNLOAD_PROJECT_FILE(),
      ensureLoggedIn(),
      makeExpressCallback(getProjectFile)
    )

    router.post(
      ROUTES.INVITE_USER_TO_PROJECT_ACTION,
      ensureLoggedIn(),
      makeExpressCallback(postInviteUserToProject)
    )

    router.post(
      ROUTES.DEPOSER_GARANTIES_FINANCIERES_ACTION,
      ensureLoggedIn(),
      upload.single('file'),
      makeExpressCallback(postGarantiesFinancieres)
    )

    router.get(
      ROUTES.ADMIN_DREAL_LIST,
      ensureLoggedIn(),
      ensureRole('admin'),
      makeExpressCallback(getDrealPage)
    )

    router.post(
      ROUTES.ADMIN_INVITE_DREAL_ACTION,
      ensureLoggedIn(),
      ensureRole('admin'),
      makeExpressCallback(postInviteDreal)
    )

    router.get(
      ROUTES.GARANTIES_FINANCIERES_LIST,
      ensureLoggedIn(),
      ensureRole(['admin', 'dreal']),
      makeExpressCallback(getGarantiesFinancieresPage)
    )

    router.get('/ping', (req, res) => {
      console.log('Call to ping')
      res.send('pong')
    })

    if (process.env.NODE_ENV === 'test') {
      router.get('/test/reset', makeExpressCallback(resetDbForTests))
      router.post('/test/addProjects', makeExpressCallback(addProjectsForTests))
      router.post(
        '/test/createInvitation',
        makeExpressCallback(createInvitationForTests)
      )
      router.get(
        '/test/getSentEmails',
        makeExpressCallback(getSentEmailsForTests)
      )
      router.post(
        '/test/checkUserAccessToProject',
        makeExpressCallback(checkUserAccessToProjectForTests)
      )
      router.post(
        '/test/createUserWithEmail',
        makeExpressCallback(createUserWithEmailForTests)
      )
      router.get(
        '/test/getProjectId',
        makeExpressCallback(getProjectIdForTests)
      )
      router.get(
        '/test/getProject',
        makeExpressCallback(getProjectHistoryForTests)
      )

      router.post(
        '/test/addUserToDreal',
        makeExpressCallback(addUserToDrealForTests)
      )
    }

    app.use(router)

    // wait for the database to initialize
    await initDatabase()

    return new Promise((resolve) => {
      const server = app.listen(port, () => {
        console.log(`Server listening on port ${port}!`)
        console.log(`NODE_ENV is ${process.env.NODE_ENV}`)
        console.log(`Version ${version}`)
        resolve(server)
      })
    })
  } catch (error) {
    console.log('Error launching server', error)
  }
}

export * from './dataAccess'
