import asyncHandler from 'express-async-handler'
import routes from '../../routes'
import { AdminRegenerateCertificatesPage } from '../../views/pages'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'

v1Router.get(
  routes.ADMIN_REGENERATE_CERTIFICATES,
  ensureRole(['admin']),
  asyncHandler(async (request, response) => {
    response.send(
      AdminRegenerateCertificatesPage({
        request,
      })
    )
  })
)
