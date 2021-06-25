import asyncHandler from 'express-async-handler'
import { getPendingCandidateInvitations } from '../../config'
import { addQueryParams } from '../../helpers/addQueryParams'
import { makePagination } from '../../helpers/paginate'
import routes from '../../routes'
import { Pagination } from '../../types'
import { InvitationListPage } from '../../views/pages'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'

const defaultPagination: Pagination = {
  page: 0,
  pageSize: 50,
}

v1Router.get(
  routes.ADMIN_INVITATION_LIST,
  ensureRole(['admin']),
  asyncHandler(async (request, response) => {
    const pagination = makePagination(request.query, defaultPagination)

    await getPendingCandidateInvitations(pagination).match(
      (invitations) => {
        return response.send(InvitationListPage({ request, invitations }))
      },
      () => {
        return response.redirect(
          addQueryParams(routes.ADMIN_DASHBOARD, {
            error: "La liste des invitations en attente n'a pas pu être générée.",
          })
        )
      }
    )
  })
)
