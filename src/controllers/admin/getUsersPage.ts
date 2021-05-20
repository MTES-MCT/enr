import asyncHandler from 'express-async-handler'
import { projectAdmissionKeyRepo, userRepo } from '../../dataAccess'
import routes from '../../routes'
import { AdminUsersPage } from '../../views/pages'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'

v1Router.get(
  routes.ADMIN_USERS,
  ensureRole(['admin']),
  asyncHandler(async (request, response) => {
    const users = await userRepo.findAll({ role: ['acheteur-obligé', 'ademe'] })

    // Get all invitations for dreals
    const invitations = await projectAdmissionKeyRepo.findAll({
      forRole: -1,
      lastUsedAt: 0,
    })

    return response.send(AdminUsersPage({ request, users, invitations }))
  })
)
