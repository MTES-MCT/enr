import moment from 'moment-timezone'
import { v4 as uuid } from 'uuid'
import { eventStore } from '../../config'
import { logger } from '../../core/utils'
import { addQueryParams } from '../../helpers/addQueryParams'
import { PeriodeNotified } from '../../modules/project/events'
import routes from '../../routes'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'
import asyncHandler from 'express-async-handler'

const FORMAT_DATE = 'DD/MM/YYYY'

v1Router.post(
  routes.ADMIN_NOTIFY_CANDIDATES_ACTION,
  ensureRole(['admin', 'dgec']),
  asyncHandler(async (request, response) => {
    const { appelOffreId, periodeId, notificationDate } = request.body

    if (
      !notificationDate ||
      moment(notificationDate, FORMAT_DATE).format(FORMAT_DATE) !== notificationDate
    ) {
      return response.redirect(
        addQueryParams(
          routes.ADMIN_NOTIFY_CANDIDATES({
            appelOffreId,
            periodeId,
          }),
          {
            error:
              "Les notifications n'ont pas pu être envoyées: la date de notification est erronnée.",
          }
        )
      )
    }

    ;(
      await eventStore.publish(
        new PeriodeNotified({
          payload: {
            appelOffreId,
            periodeId,
            notifiedOn: moment(notificationDate, FORMAT_DATE).tz('Europe/Paris').toDate().getTime(),
            requestedBy: request.user.id,
          },
          requestId: uuid(),
        })
      )
    ).match(
      () =>
        response.redirect(
          routes.SUCCESS_PAGE({
            success: `La période ${appelOffreId} - ${periodeId} a bien été notifiée.`,
            redirectUrl: addQueryParams(routes.ADMIN_LIST_PROJECTS, {
              appelOffreId,
              periodeId,
            }),
            redirectTitle: 'Lister les projets de cette période',
          })
        ),
      (e: Error) => {
        logger.error(e)
        return response.redirect(
          addQueryParams(
            routes.ADMIN_NOTIFY_CANDIDATES({
              appelOffreId,
              periodeId,
            }),
            {
              error: "La période n'a pas pu être notifiée. (" + e.message + ')',
            }
          )
        )
      }
    )
  })
)
