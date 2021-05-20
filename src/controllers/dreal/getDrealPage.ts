import { projectAdmissionKeyRepo, userRepo } from '../../dataAccess'
import routes from '../../routes'
import { DrealListPage } from '../../views/pages'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'
import asyncHandler from 'express-async-handler'

v1Router.get(
  routes.ADMIN_DREAL_LIST,
  ensureRole('admin'),
  asyncHandler(async (request, response) => {
    // Get all dreal users
    const drealUsers = await userRepo.findAll({ role: 'dreal' })
    const users = await Promise.all(
      drealUsers.map(async (user) => {
        const dreals = await userRepo.findDrealsForUser(user.id)
        return { user, dreals }
      })
    )

    // Get all invitations for dreals
    const invitations = await projectAdmissionKeyRepo.findAll({
      dreal: -1,
      lastUsedAt: 0,
    })

    return response.send(DrealListPage({ request, users, invitations }))
  })
)
