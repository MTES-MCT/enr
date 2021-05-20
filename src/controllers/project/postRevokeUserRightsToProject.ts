import asyncHandler from 'express-async-handler'
import { revokeUserRightsToProject } from '../../config/useCases.config'
import { logger } from '../../core/utils'
import { addQueryParams } from '../../helpers/addQueryParams'
import { UnauthorizedError } from '../../modules/shared'
import routes from '../../routes'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'

v1Router.get(
  routes.REVOKE_USER_RIGHTS_TO_PROJECT_ACTION(),
  ensureRole(['admin', 'dgec', 'dreal', 'porteur-projet']),
  asyncHandler(async (request, response) => {
    const { userId, projectId } = request.query as any
    const { user } = request

    const redirectTo = routes.PROJECT_DETAILS(projectId)

    if (!userId || !projectId) {
      return response.status(404).send('Action impossible.')
    }

    ;(
      await revokeUserRightsToProject({
        projectId,
        userId,
        revokedBy: user,
      })
    ).match(
      () =>
        response.redirect(
          addQueryParams(redirectTo, {
            success: `Vous avez bien révoqué les droits sur ce projet pour cet utilisateur`,
          })
        ),
      (error) => {
        let errorMessage = ''

        if (error instanceof UnauthorizedError) {
          errorMessage = "Vous n'avez pas les droits suffisants pour cette action."
        } else {
          logger.error(error)
          errorMessage = 'Un problème technique est survenu, merci de réessayer.'
        }

        response.redirect(
          addQueryParams(redirectTo, {
            error: errorMessage,
          })
        )
      }
    )
  })
)
