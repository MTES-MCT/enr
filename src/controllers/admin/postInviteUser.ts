import asyncHandler from 'express-async-handler'
import { createUser } from '../../config'
import { addQueryParams } from '../../helpers/addQueryParams'
import routes from '../../routes'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'

v1Router.post(
  routes.ADMIN_INVITE_USER_ACTION,
  ensureRole('admin'),
  asyncHandler(async (request, response) => {
    const { email, role } = request.body

    if (!['acheteur-obligé'].includes(role)) {
      return response.redirect(
        addQueryParams(routes.ADMIN_USERS, {
          error: 'Le role attendu n‘est pas reconnu.',
        })
      )
    }

    ;(
      await createUser({
        email: email.toLowerCase(),
        role,
        createdBy: request.user,
      })
    ).match(
      () =>
        response.redirect(
          addQueryParams(routes.ADMIN_USERS, {
            success: `Une invitation a bien été envoyée à ${email}`,
          })
        ),
      (error: Error) =>
        response.redirect(
          addQueryParams(routes.ADMIN_USERS, {
            error: error.message,
          })
        )
    )
  })
)
