import { getModificationRequestDetails } from '../../config'
import { logger } from '../../core/utils'
import { addQueryParams } from '../../helpers/addQueryParams'
import routes from '../../routes'
import { ModificationRequestDetailsPage } from '../../views/pages'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'
import asyncHandler from 'express-async-handler'

v1Router.get(
  routes.DEMANDE_PAGE_DETAILS(),
  ensureRole(['admin', 'dgec', 'dreal', 'porteur-projet']),
  asyncHandler(async (request, response) => {
    const isAdmin = ['admin', 'dgec'].includes(request.user.role)

    const modificationRequestResult = await getModificationRequestDetails(
      request.params.modificationRequestId
    )

    return modificationRequestResult.match(
      (modificationRequest) => {
        response.send(ModificationRequestDetailsPage({ request, modificationRequest }))
      },
      (e) => {
        logger.error(e)
        response.redirect(
          addQueryParams(isAdmin ? routes.ADMIN_LIST_REQUESTS : routes.USER_LIST_REQUESTS, {
            error: e.message,
          })
        )
      }
    )
  })
)
