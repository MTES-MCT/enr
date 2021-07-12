import { addQueryParams } from '../../helpers/addQueryParams'
import routes from '../../routes'
import { inviteUserToProject } from '../../useCases'
import { ensureLoggedIn, ensureRole } from '../auth'
import { v1Router } from '../v1Router'
import asyncHandler from 'express-async-handler'

v1Router.post(
  routes.USER_CLAIM_PROJECTS,
  ensureLoggedIn(),
  ensureRole('porteur-projet'),
  asyncHandler(async (request, response) => {
    const { projectIds } = request.body
    const { user } = request

    ;(
      await claimProjects({
        projectIds,
        user,
      })
    ).match({
      ok: () =>
        response.redirect(
          addQueryParams(routes.USER_LIST_MISSING_OWNER_PROJECTS, {
            success: `Vous venez de réclamer la propriété de ${projectIds.length} projets`,
          })
        ),
      err: (error: Error) =>
        response.redirect(
          addQueryParams(routes.USER_LIST_MISSING_OWNER_PROJECTS, {
            error: error.message,
          })
        ),
    })
  })
)
