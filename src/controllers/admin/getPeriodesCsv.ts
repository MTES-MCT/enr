import asyncHandler from 'express-async-handler'
import { parseAsync } from 'json2csv'
import { getPeriodeList } from '../../config/queries.config'
import { logger } from '../../core/utils'
import routes from '../../routes'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'

v1Router.get(
  routes.EXPORT_PERIODE_CSV,
  ensureRole(['admin']),
  asyncHandler(async (request, response) => {
    await getPeriodeList().match(
      async (periodeList) => {
        const reformatedPeriodeList = periodeList.map(({ appelOffreId, periodeId, ...data }) => ({
          "Appel d'offres": appelOffreId,
          Période: periodeId,
          ...data,
        }))

        const csv = await parseAsync(reformatedPeriodeList, { delimiter: ';' })
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
