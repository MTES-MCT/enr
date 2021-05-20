import { addQueryParams } from '../../helpers/addQueryParams'
import routes from '../../routes'
import { inviteUserToProject } from '../../useCases'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'
import asyncHandler from 'express-async-handler'

v1Router.post(
  routes.INVITE_USER_TO_PROJECT_ACTION,
  ensureRole(['admin', 'dgec', 'dreal', 'porteur-projet']),
  asyncHandler(async (request, response) => {
    const { email, projectId } = request.body
    const { user } = request

    const isMultiProject = Array.isArray(projectId)

    let redirectTo = routes.PROJECT_DETAILS(projectId)

    if (isMultiProject) {
      redirectTo =
        user.role === 'porteur-projet' ? routes.USER_LIST_PROJECTS : routes.ADMIN_LIST_PROJECTS
    }

    ;(
      await inviteUserToProject({
        email: email.toLowerCase(),
        projectId,
        user,
      })
    ).match({
      ok: () =>
        response.redirect(
          addQueryParams(redirectTo, {
            success: 'Une invitation a bien été envoyée à ' + email,
          })
        ),
      err: (error: Error) =>
        response.redirect(
          addQueryParams(redirectTo, {
            error: error.message,
          })
        ),
    })
  })
)
