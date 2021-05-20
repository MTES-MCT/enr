import { logger } from '../../core/utils'
import { addQueryParams } from '../../helpers/addQueryParams'
import routes from '../../routes'
import { removeStep } from '../../config/useCases.config'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'
import asyncHandler from 'express-async-handler'
import { asLiteral } from '../../helpers/asLiteral'

v1Router.get(
  routes.SUPPRIMER_ETAPE_ACTION(),
  ensureRole(['admin', 'dgec', 'porteur-projet']),
  asyncHandler(async (request, response) => {
    const { user } = request
    const { projectId, type } = request.params

    if (!projectId || !['ptf', 'dcr', 'garantie-financiere'].includes(type)) {
      return response.status(400).send('Requête erronnée')
    }

    ;(
      await removeStep({
        removedBy: user,
        projectId,
        type: asLiteral(type),
      })
    ).match(
      () =>
        response.redirect(
          addQueryParams(routes.PROJECT_DETAILS(projectId), {
            success: 'Le dépôt été annulé avec succès',
          })
        ),
      (e: Error) => {
        logger.error(e)
        return response.redirect(
          addQueryParams(routes.PROJECT_DETAILS(projectId), {
            error: `Le dépôt n'a pas pu être annulé.`,
          })
        )
      }
    )
  })
)
