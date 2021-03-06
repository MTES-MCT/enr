import asyncHandler from 'express-async-handler'
import { importAppelOffreData } from '../../config'
import { logger } from '../../core/utils'
import { addQueryParams } from '../../helpers/addQueryParams'
import { parseCsv } from '../../helpers/parseCsv'
import { InfraNotAvailableError, UnauthorizedError } from '../../modules/shared'
import routes from '../../routes'
import { ensureLoggedIn, ensureRole } from '../auth'
import { upload } from '../upload'
import { v1Router } from '../v1Router'

v1Router.post(
  routes.IMPORT_AO_ACTION,
  ensureLoggedIn(),
  ensureRole(['admin', 'dgec']),
  upload.single('appelsOffresFile'),
  asyncHandler(async (request, response) => {
    if (!request.file?.path) {
      return response.redirect(
        addQueryParams(routes.ADMIN_AO_PERIODE, {
          error: 'Le fichier des appels d‘offre est manquant.',
        })
      )
    }

    await parseCsv(request.file.path, { delimiter: ',', encoding: 'utf8' })
      .andThen((dataLines) =>
        importAppelOffreData({
          dataLines,
          importedBy: request.user,
        })
      )
      .match(
        () => {
          return response.redirect(
            addQueryParams(routes.ADMIN_AO_PERIODE, {
              success: "L'import des données d'appel d'offres est un succès.",
            })
          )
        },
        (errors) => {
          function redirectWithError(errorMessage) {
            return response.redirect(
              addQueryParams(routes.ADMIN_AO_PERIODE, {
                error: errorMessage,
              })
            )
          }

          if (!Array.isArray(errors)) {
            return redirectWithError(`Le fichier csv n'a pas pu être importé: ${errors.message}`)
          }

          if (!errors.length) {
            logger.error(new Error('importAppelOffreData a échoué mais sans contenir d‘erreur.'))
            return redirectWithError(
              "L'import a échoué pour des raisons techniques. Merci de prévenir un administrateur."
            )
          }

          if (errors[0] instanceof InfraNotAvailableError) {
            logger.error(errors[0])
            return redirectWithError(
              "L'import a échoué pour des raisons techniques. Merci de prévenir un administrateur."
            )
          }

          if (errors[0] instanceof UnauthorizedError) {
            logger.error(errors[0])
            return redirectWithError(
              "Vous n'avez pas les droits suffisants pour effectuer cette action."
            )
          }

          const globalMessage = errors.map((error) => error.message).join('\n')

          return redirectWithError(
            globalMessage.length > 1000 ? globalMessage.substring(0, 1000) + '...' : globalMessage
          )
        }
      )
  })
)
