import { addQueryParams } from '../../helpers/addQueryParams'
import routes from '../../routes'
import { inviteUserToProject } from '../../config'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'
import asyncHandler from 'express-async-handler'

v1Router.post(
  routes.INVITE_USER_TO_PROJECT_ACTION,
  ensureRole(['admin', 'dgec', 'dreal', 'porteur-projet']),
  asyncHandler(async (request, response) => {
    const { email, projectId } = request.body
    const { user } = request

    const projectIds = Array.isArray(projectId) ? projectId : [projectId]

    const redirectTo = request.get('Referrer') || routes.REDIRECT_BASED_ON_ROLE
    ;(
      await inviteUserToProject({
        email: email.toLowerCase(),
        projectIds,
        invitedBy: user,
      })
    ).match(
      () =>
        response.redirect(
          addQueryParams(redirectTo, {
            success: 'Une invitation a bien été envoyée à ' + email,
          })
        ),
      (error: Error) =>
        response.redirect(
          addQueryParams(redirectTo, {
            error: error.message,
          })
        )
    )
  })
)
