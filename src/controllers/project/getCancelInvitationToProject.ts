import asyncHandler from 'express-async-handler'
import { cancelInvitationToProject } from '../../config/useCases.config'
import { logger } from '../../core/utils'
import { addQueryParams } from '../../helpers/addQueryParams'
import { EntityNotFoundError, UnauthorizedError } from '../../modules/shared'
import routes from '../../routes'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'

v1Router.get(
  routes.CANCEL_INVITATION_TO_PROJECT_ACTION(),
  ensureRole(['admin', 'dgec', 'dreal', 'porteur-projet']),
  asyncHandler(async (request, response) => {
    const { projectAdmissionKeyId, projectId } = request.query as any
    const { user } = request

    if (!projectAdmissionKeyId || !projectId) {
      return response.status(404).send('Action impossible.')
    }

    const redirectTo = routes.PROJECT_DETAILS(projectId)

    ;(
      await cancelInvitationToProject({
        projectAdmissionKeyId,
        cancelledBy: user,
      })
    ).match(
      () =>
        response.redirect(
          addQueryParams(redirectTo, {
            success: `Vous avez bien annulé cette invitation.`,
          })
        ),
      (error) => {
        let errorMessage = ''

        if (error instanceof UnauthorizedError) {
          errorMessage = "Vous n'avez pas les droits suffisants pour cette action."
        } else if (error instanceof EntityNotFoundError) {
          errorMessage = 'Cette invitation n‘existe pas ou plus.'
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
