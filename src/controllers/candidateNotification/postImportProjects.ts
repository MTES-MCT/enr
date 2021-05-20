import asyncHandler from 'express-async-handler'
import { logger } from '../../core/utils'
import { addQueryParams } from '../../helpers/addQueryParams'
import { parseCsv } from '../../helpers/parseCsv'
import routes from '../../routes'
import { importProjects } from '../../useCases'
import { ensureRole } from '../auth'
import { upload } from '../upload'
import { v1Router } from '../v1Router'

v1Router.post(
  routes.IMPORT_PROJECTS_ACTION,
  ensureRole(['admin', 'dgec']),
  upload.single('candidats'),
  asyncHandler(async (request, response) => {
    if (!request.file || !request.file.path) {
      return response.redirect(
        addQueryParams(routes.IMPORT_PROJECTS, {
          error: 'Le fichier candidat est manquant.',
        })
      )
    }

    // Parse the csv file
    const linesResult = await parseCsv(request.file.path, { delimiter: ';', encoding: 'win1252' })
    if (linesResult.isErr()) {
      const csvError = linesResult.error
      return response.redirect(
        addQueryParams(routes.IMPORT_PROJECTS, {
          error: `Le fichier csv n'a pas pu être importé: ${csvError.message}`,
        })
      )
    }

    ;(
      await importProjects({
        lines: linesResult.value,
        userId: request.user.id,
      })
    ).match({
      ok: (result) => {
        const { unnotifiedProjects, savedProjects } = result || {}
        return response.redirect(
          addQueryParams(routes.IMPORT_PROJECTS, {
            success: savedProjects
              ? `${savedProjects} projet(s) ont bien été importé(s) ou mis à jour${
                  unnotifiedProjects ? ` dont ${unnotifiedProjects} à notifier` : ''
                }.`
              : "L'import est un succès mais le fichier importé n'a pas donné lieu à des changements dans la base de projets.",
          })
        )
      },
      err: (e: Error) => {
        logger.error(e)
        return response.redirect(
          addQueryParams(routes.IMPORT_PROJECTS, {
            error: e.message.length > 1000 ? e.message.substring(0, 1000) + '...' : e.message,
          })
        )
      },
    })
  })
)
