import { UniqueEntityID } from '../../core/domain'
import { logger } from '../../core/utils'
import { toProjectDataForCertificate } from '../../modules/project/mappers'
import { ProjectProps } from '../../modules/project/Project'
import { IncompleteDataError } from '../../modules/shared'
import routes from '../../routes'
import { v1Router } from '../v1Router'
import asyncHandler from 'express-async-handler'
import { ensureRole } from '../auth'
import { getUserProject } from '../../useCases'
import { buildCertificate } from '../../views/certificates'

v1Router.get(
  routes.PREVIEW_CANDIDATE_CERTIFICATE(),
  ensureRole(['admin', 'dgec']),
  asyncHandler(async (request, response) => {
    const { projectId } = request.params

    // Verify that the current user has the rights to check this out
    const project = await getUserProject({ user: request.user, projectId })

    if (!project) {
      return response
        .status(404)
        .send(
          'Impossible de trouver cette attestation. Etes-vous connecté avec le bon compte de porteur de projet ?'
        )
    }

    const periode = project.appelOffre?.periode

    if (!periode || !periode.isNotifiedOnPotentiel || !periode.certificateTemplate) {
      return response
        .status(404)
        .send("Impossible de trouver le modèle d'attestation pour ce projet")
    }

    const { certificateTemplate } = periode

    await toProjectDataForCertificate({
      appelOffre: project.appelOffre,
      isClasse: project.classe === 'Classé',
      notifiedOn: project.notifiedOn,
      projectId: new UniqueEntityID(project.id),
      data: project as unknown,
    } as ProjectProps)
      .asyncAndThen((data) =>
        buildCertificate({
          template: certificateTemplate,
          data,
        })
      )
      .match(
        (certificateStream) => {
          certificateStream.pipe(response)
        },
        (e: Error) => {
          logger.error(e)

          if (e instanceof IncompleteDataError) {
            response
              .status(400)
              .send("Impossible de générer l'attestion parce qu'il manque des données.")
          } else {
            response.status(500).send("Erreur lors de la génération de l'attestation: " + e.message)
          }
        }
      )
  })
)
