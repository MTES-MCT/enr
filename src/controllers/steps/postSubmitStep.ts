import asyncHandler from 'express-async-handler'
import fs from 'fs'
import moment from 'moment'
import { submitStep } from '../../config/useCases.config'
import { logger } from '../../core/utils'
import { addQueryParams } from '../../helpers/addQueryParams'
import { pathExists } from '../../helpers/pathExists'
import routes from '../../routes'
import { ensureRole } from '../auth'
import { upload } from '../upload'
import { v1Router } from '../v1Router'

v1Router.post(
  routes.DEPOSER_ETAPE_ACTION,
  ensureRole(['admin', 'dgec', 'dreal', 'porteur-projet']),
  upload.single('file'),
  asyncHandler(async (request, response) => {
    const { type, stepDate, projectId, numeroDossier } = request.body

    if (!projectId || !['ptf', 'dcr', 'garantie-financiere'].includes(type)) {
      return response.status(400).send('Requête erronée')
    }

    if (!stepDate) {
      return response.redirect(
        addQueryParams(routes.PROJECT_DETAILS(projectId), {
          error: "Votre dépôt n'a pas pu être transmis. La date est obligatoire.",
        })
      )
    }

    if (!isDateFormatValid(stepDate)) {
      return response.redirect(
        addQueryParams(routes.PROJECT_DETAILS(projectId), {
          error:
            "Votre dépôt n'a pas pu être transmis. La date envoyée n'est pas au bon format (JJ/MM/AAAA)",
        })
      )
    }

    const attestationExists: boolean = !!request.file && (await pathExists(request.file.path))

    if (!attestationExists) {
      return response.redirect(
        addQueryParams(routes.PROJECT_DETAILS(projectId), {
          error:
            "Votre dépôt n'a pas pu être transmis. Merci d'attacher l'attestation en pièce-jointe.",
        })
      )
    }

    const file = {
      contents: fs.createReadStream(request.file.path),
      filename: `${Date.now()}-${request.file.originalname}`,
    }

    ;(
      await submitStep({
        type,
        projectId,
        stepDate: moment(stepDate, 'DD/MM/YYYY').toDate(),
        file,
        numeroDossier,
        submittedBy: request.user,
      })
    ).match(
      () =>
        response.redirect(
          routes.SUCCESS_PAGE({
            success: 'Votre dépôt a bien été enregistré.',
            redirectUrl: routes.PROJECT_DETAILS(projectId),
            redirectTitle: 'Retourner à la page projet',
          })
        ),
      (e) => {
        logger.error(e)
        return response.redirect(
          addQueryParams(routes.PROJECT_DETAILS(projectId), {
            stepDate,
            error: `Votre demande n'a pas pu être prise en compte: ${e.message}`,
          })
        )
      }
    )
  })
)

function isDateFormatValid(dateStr: string) {
  return moment(dateStr, 'DD/MM/YYYY').isValid()
}
