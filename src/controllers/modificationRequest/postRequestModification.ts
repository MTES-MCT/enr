import asyncHandler from 'express-async-handler'
import fs from 'fs'
import _ from 'lodash'
import { logger } from '../../core/utils'
import { addQueryParams } from '../../helpers/addQueryParams'
import { pathExists } from '../../helpers/pathExists'
import { isStrictlyPositiveNumber } from '../../helpers/formValidators'
import routes from '../../routes'
import { requestModification, shouldUserAccessProject } from '../../useCases'
import { ensureRole } from '../auth'
import { upload } from '../upload'
import { v1Router } from '../v1Router'
import { requestPuissanceModification, requestActionnaireModification } from '../../config'
import { PuissanceJustificationOrCourrierMissingError } from '../../modules/modificationRequest'

const returnRoute = (type, projectId) => {
  let returnRoute: string
  switch (type) {
    case 'delai':
      returnRoute = routes.DEMANDE_DELAIS(projectId)
      break
    case 'fournisseur':
      returnRoute = routes.CHANGER_FOURNISSEUR(projectId)
      break
    case 'actionnaire':
      returnRoute = routes.CHANGER_ACTIONNAIRE(projectId)
      break
    case 'puissance':
      returnRoute = routes.CHANGER_PUISSANCE(projectId)
      break
    case 'producteur':
      returnRoute = routes.CHANGER_PRODUCTEUR(projectId)
      break
    case 'abandon':
      returnRoute = routes.DEMANDER_ABANDON(projectId)
      break
    case 'recours':
      returnRoute = routes.DEPOSER_RECOURS(projectId)
      break
    default:
      returnRoute = routes.USER_LIST_PROJECTS
      break
  }
  return returnRoute
}

v1Router.post(
  routes.DEMANDE_ACTION,
  ensureRole('porteur-projet'),
  upload.single('file'),
  asyncHandler(async (request, response) => {
    if (!request.user) {
      return response.status(500).send('User must be logged in')
    }

    const userAccess = await shouldUserAccessProject({
      projectId: request.body.projectId,
      user: request.user,
    })

    if (!userAccess) {
      return response.redirect(routes.USER_DASHBOARD)
    }

    const data = _.pick(request.body, [
      'type',
      'actionnaire',
      'producteur',
      'fournisseur',
      'puissance',
      'justification',
      'projectId',
      'evaluationCarbone',
      'delayInMonths',
      'numeroGestionnaire',
    ])

    if (data.type === 'puissance' && !isStrictlyPositiveNumber(data.puissance)) {
      const { projectId, type } = data
      return response.redirect(
        addQueryParams(returnRoute(type, projectId), {
          error: 'Erreur: la puissance n‘est pas valide.',
        })
      )
    }

    data.puissance = data.puissance && Number(data.puissance)

    if (data.type === 'fournisseur' && !isStrictlyPositiveNumber(data.evaluationCarbone)) {
      const { projectId, type } = data
      return response.redirect(
        addQueryParams(returnRoute(type, projectId), {
          error: 'Erreur: la valeur de l‘évaluation carbone n‘est pas valide.',
        })
      )
    }
    data.evaluationCarbone = data.evaluationCarbone && Number(data.evaluationCarbone)

    if (data.type === 'delai' && !isStrictlyPositiveNumber(data.delayInMonths)) {
      if (!data.delayInMonths || isNaN(data.delayInMonths) || data.delayInMonths <= 0) {
        const { projectId, type } = data
        return response.redirect(
          addQueryParams(returnRoute(type, projectId), {
            error: 'Erreur: le nombre de mois de délai doit être strictement supérieur à 0',
          })
        )
      }
    }
    data.delayInMonths = data.delayInMonths && Number(data.delayInMonths)

    let file

    if (request.file) {
      const dirExists: boolean = await pathExists(request.file.path)

      if (!dirExists) {
        const { projectId, type } = data
        return response.redirect(
          addQueryParams(returnRoute(type, projectId), {
            error: "Erreur: la pièce-jointe n'a pas pu être intégrée. Merci de réessayer.",
          })
        )
      }

      file = {
        contents: fs.createReadStream(request.file.path),
        filename: `${Date.now()}-${request.file.originalname}`,
      }
    }

    const handleSuccess = () =>
      response.redirect(
        routes.SUCCESS_PAGE({
          success: 'Votre demande a bien été prise en compte.',
          redirectUrl: routes.USER_LIST_REQUESTS,
          redirectTitle: 'Voir mes demandes',
        })
      )

    const handleError = (error) => {
      logger.error(error)
      const { projectId, type } = data
      const redirectRoute = returnRoute(type, projectId)

      const errorMessage =
        error instanceof PuissanceJustificationOrCourrierMissingError
          ? error.message
          : "Votre demande n'a pas pu être prise en compte. Merci de réessayer."

      return response.redirect(
        addQueryParams(redirectRoute, {
          ..._.omit(data, 'projectId'),
          error: errorMessage,
        })
      )
    }

    switch (data.type) {
      case 'puissance':
        await requestPuissanceModification({
          projectId: data.projectId,
          requestedBy: request.user,
          newPuissance: data.puissance,
          justification: data.justification,
          file,
        }).match(handleSuccess, handleError)
        break
      case 'actionnaire':
        await requestActionnaireModification({
          projectId: data.projectId,
          requestedBy: request.user,
          newActionnaire: data.actionnaire,
          justification: data.justification,
          file,
        }).match(handleSuccess, handleError)
        break
      default:
        ;(
          await requestModification({
            ...data,
            file,
            user: request.user,
          })
        ).match({
          ok: handleSuccess,
          err: handleError,
        })
        break
    }
  })
)
