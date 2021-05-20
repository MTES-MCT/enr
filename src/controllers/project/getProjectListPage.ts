import { appelOffreRepo } from '../../dataAccess'
import { makePagination } from '../../helpers/paginate'
import routes from '../../routes'
import { Pagination } from '../../types'
import { listProjects } from '../../useCases'
import { ListProjectsPage } from '../../views/pages'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'
import asyncHandler from 'express-async-handler'

const getProjectListPage = asyncHandler(async (request, response) => {
  let {
    appelOffreId,
    periodeId,
    familleId,
    recherche,
    classement,
    garantiesFinancieres,
    pageSize,
  } = request.query as any
  const { user } = request

  // Set default filter on classés for admins
  if (['admin', 'dgec', 'dreal'].includes(user.role) && typeof classement === 'undefined') {
    classement = 'classés'
    request.query.classement = 'classés'
  }

  const defaultPagination: Pagination = {
    page: 0,
    pageSize: +request.cookies?.pageSize || 10,
  }
  const pagination = makePagination(request.query, defaultPagination)

  const appelsOffre = await appelOffreRepo.findAll()

  if (!appelOffreId) {
    // Reset the periodId and familleId if there is no appelOffreId
    periodeId = undefined
    familleId = undefined
  }

  const results = await listProjects({
    user,
    appelOffreId,
    periodeId,
    familleId,
    pagination,
    recherche,
    classement,
    garantiesFinancieres,
  })

  const { projects, existingAppelsOffres, existingPeriodes, existingFamilles } = results

  if (pageSize) {
    // Save the pageSize in a cookie
    response.cookie('pageSize', pageSize, {
      maxAge: 1000 * 60 * 60 * 24 * 30 * 3, // 3 months
      httpOnly: true,
    })
  }

  response.send(
    ListProjectsPage({
      request,
      projects,
      existingAppelsOffres,
      existingPeriodes,
      existingFamilles,
      appelsOffre,
    })
  )
})

v1Router.get(routes.ADMIN_DASHBOARD, ensureRole(['admin', 'dgec', 'dreal']), getProjectListPage)

v1Router.get(
  routes.USER_DASHBOARD,
  ensureRole(['porteur-projet', 'acheteur-obligé']),
  getProjectListPage
)
