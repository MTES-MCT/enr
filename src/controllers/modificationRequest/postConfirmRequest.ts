import asyncHandler from 'express-async-handler'
import { confirmRequest } from '../../config'
import { logger } from '../../core/utils'
import { addQueryParams } from '../../helpers/addQueryParams'
import { AggregateHasBeenUpdatedSinceError } from '../../modules/shared'
import routes from '../../routes'
import { ensureLoggedIn, ensureRole } from '../auth'
import { v1Router } from '../v1Router'

const FORMAT_DATE = 'DD/MM/YYYY'

v1Router.post(
  routes.ADMIN_REPLY_TO_MODIFICATION_REQUEST,
  ensureLoggedIn(),
  ensureRole(['porteur-projet']),
  asyncHandler(async (request, response) => {
    const { modificationRequestId, type, versionDate } = request.body

    return confirmRequest({
      modificationRequestId,
      versionDate: new Date(Number(versionDate)),
      confirmedBy: request.user,
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
        success: 'Votre demande a bien été confirmée.',
        redirectUrl: routes.DEMANDE_PAGE_DETAILS(modificationRequestId),
        redirectTitle: 'Retourner à la demande',
      })
    )
  }
}

function _handleErrors(response, modificationRequestId) {
  return (e) => {
    logger.error(e)

    if (e instanceof AggregateHasBeenUpdatedSinceError) {
      return response.redirect(
        addQueryParams(routes.DEMANDE_PAGE_DETAILS(modificationRequestId), {
          error: `Votre confirmation n'a pas pu être prise en compte parce que la demande a été mise à jour entre temps. Merci de réessayer.`,
        })
      )
    }

    response.redirect(
      addQueryParams(routes.DEMANDE_PAGE_DETAILS(modificationRequestId), {
        error: `Votre confirmation n'a pas pu être prise en compte. Merci de contacter un administrateur.`,
      })
    )
  }
}
