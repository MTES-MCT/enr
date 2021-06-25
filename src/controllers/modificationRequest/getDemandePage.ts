import { projectRepo } from '../../dataAccess'
import { addQueryParams } from '../../helpers/addQueryParams'
import { NewModificationRequestPage } from '../../views/pages'
import routes from '../../routes'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'
import asyncHandler from 'express-async-handler'

const ACTIONS = [
  'delai',
  'actionnaire',
  'puissance',
  'producteur',
  'abandon',
  'recours',
  'fournisseur',
]

v1Router.get(
  routes.DEMANDE_GENERIQUE,
  ensureRole('porteur-projet'),
  asyncHandler(async (request, response) => {
    const { action, projectId } = request.query as any

    if (!projectId || !ACTIONS.includes(action)) {
      return response.redirect(routes.USER_DASHBOARD)
    }

    const project = await projectRepo.findById(projectId)

    return project
      ? response.send(
          NewModificationRequestPage({
            request,
            project,
          })
        )
      : response.redirect(
          addQueryParams(routes.USER_DASHBOARD, {
            error: "Le projet demandé n'existe pas",
          })
        )
  })
)
