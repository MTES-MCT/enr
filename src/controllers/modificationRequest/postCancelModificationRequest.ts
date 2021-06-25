import asyncHandler from 'express-async-handler'
import { cancelModificationRequest } from '../../config'
import { logger } from '../../core/utils'
import { addQueryParams } from '../../helpers/addQueryParams'
import routes from '../../routes'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'

v1Router.post(
  routes.ANNULER_DEMANDE_ACTION,
  ensureRole(['porteur-projet']),
  asyncHandler(async (request, response) => {
    const { modificationRequestId } = request.body

    return cancelModificationRequest({
      modificationRequestId,
      cancelledBy: request.user,
    }).match(
      _handleSuccess(response, modificationRequestId),
      _handleErrors(response, modificationRequestId)
    )
  })
)

function _handleSuccess(response, modificationRequestId) {
  return () => {
    response.redirect(
      routes.SUCCESS_PAGE({
        success: 'Votre demande a bien été annulée.',
        redirectUrl: routes.DEMANDE_PAGE_DETAILS(modificationRequestId),
        redirectTitle: 'Retourner à la demande',
      })
    )
  }
}

function _handleErrors(response, modificationRequestId) {
  return (e) => {
    logger.error(e)

    response.redirect(
      addQueryParams(routes.DEMANDE_PAGE_DETAILS(modificationRequestId), {
        error: `Votre demande n'a pas pu être annulée. Merci de réessayer.`,
      })
    )
  }
}
