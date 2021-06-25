import asyncHandler from 'express-async-handler'
import routes from '../../routes'
import { AdminAppelOffrePage } from '../../views/pages'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'

v1Router.get(
  routes.ADMIN_AO_PERIODE,
  ensureRole(['admin']),
  asyncHandler(async (request, response) => {
    return response.send(AdminAppelOffrePage({ request }))
  })
)
