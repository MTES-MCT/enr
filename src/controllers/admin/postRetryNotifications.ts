import asyncHandler from 'express-async-handler'
import { retryFailedNotifications } from '../../config'
import routes from '../../routes'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'

v1Router.post(
  routes.ADMIN_NOTIFICATION_RETRY_ACTION,
  ensureRole(['admin']),
  asyncHandler(async (request, response) => {
    const notificationsRetried = await retryFailedNotifications()

    return response.redirect(
      routes.SUCCESS_PAGE({
        success: notificationsRetried
          ? `${notificationsRetried} notifications ont été renvoyées`
          : `Aucun notification n'a été renvoyée. Merci de vérifier qu'il y a bien des notifications en erreur.`,
        redirectUrl: routes.ADMIN_NOTIFICATION_LIST,
        redirectTitle: 'Retourner à la page des emails',
      })
    )
  })
)
