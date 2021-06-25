import asyncHandler from 'express-async-handler'
import routes from '../routes'
import { InvitationsAreDeprecatedPage } from '../views/pages'
import { v1Router } from './v1Router'

/**
 * This page is used to display a message to users trying to use an old invitation link
 * (these links were deprecated when moving to keycloak)
 */
v1Router.get(
  routes.USER_INVITATION,
  asyncHandler(async (request, response) => {
    response.send(InvitationsAreDeprecatedPage({ request }))
  })
)
