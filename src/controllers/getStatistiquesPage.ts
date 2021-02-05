import { getStats } from '../config'
import { logger } from '../core/utils'
import routes from '../routes'
import { StatistiquesPage } from '../views'
import { v1Router } from './v1Router'
import asyncHandler from 'express-async-handler'

v1Router.get(
  routes.STATS,
  asyncHandler(async (request, response) => {
    await getStats().match(
      (stats) => {
        response.send(StatistiquesPage(stats))
      },
      (e) => {
        logger.error(e)
        response.status(500).send('Les statistiques ne sont pas disponibles pour le moment.')
      }
    )
  })
)
