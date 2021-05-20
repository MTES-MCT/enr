import asyncHandler from 'express-async-handler'
import { getProjectDataForProjectPage } from '../../config/queries.config'
import { shouldUserAccessProject } from '../../config/useCases.config'
import { EntityNotFoundError } from '../../modules/shared'
import routes from '../../routes'
import { ProjectDetailsPage } from '../../views/pages'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'

v1Router.get(
  routes.PROJECT_DETAILS(),
  ensureRole(['admin', 'dgec', 'dreal', 'porteur-projet', 'acheteur-obligé']),
  asyncHandler(async (request, response) => {
    const { projectId } = request.params
    const { user } = request

    const userHasRightsToProject = await shouldUserAccessProject.check({
      user,
      projectId,
    })
    if (!userHasRightsToProject) {
      return response.status(403).send('Vous n‘êtes pas autorisé à consulter ce projet.')
    }

    ;(await getProjectDataForProjectPage({ projectId, user })).match(
      (project) => {
        response.send(
          ProjectDetailsPage({
            request,
            project,
          })
        )
      },
      (e) => {
        if (e instanceof EntityNotFoundError) {
          return response.status(404).send('Le projet est introuvable.')
        }

        return response
          .status(500)
          .send('Une erreur est survenue. Merci de réessayer ou de contacter un administrateur.')
      }
    )
  })
)
