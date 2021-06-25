import asyncHandler from 'express-async-handler'
import { parseAsync } from 'json2csv'
import { getAppelOffreList } from '../../config/queries.config'
import { logger } from '../../core/utils'
import routes from '../../routes'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'

v1Router.get(
  routes.EXPORT_AO_CSV,
  ensureRole(['admin']),
  asyncHandler(async (request, response) => {
    await getAppelOffreList().match(
      async (appelOffreList) => {
        const reformatedAppelOffreList = appelOffreList.map(({ appelOffreId, ...data }) => ({
          "Appel d'offres": appelOffreId,
          ...data,
        }))
        const csv = await parseAsync(reformatedAppelOffreList, { delimiter: ';' })
        response.type('text/csv').send(csv)
        return
      },
      async (e) => {
        logger.error(e)
        response.status(500).send('Impossible de générer ce fichier')
        return
      }
    )
  })
)
