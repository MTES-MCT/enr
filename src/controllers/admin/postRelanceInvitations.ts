import asyncHandler from 'express-async-handler'
import { relanceInvitation } from '../../config'
import { addQueryParams } from '../../helpers/addQueryParams'
import routes from '../../routes'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'

v1Router.post(
  routes.ADMIN_INVITATION_RELANCE_ACTION,
  ensureRole(['admin']),
  asyncHandler(async (request, response) => {
    const { email } = request.body

    const redirectTo = request.get('Referrer') || routes.ADMIN_INVITATION_LIST

    await relanceInvitation({ email, relanceBy: request.user }).match(
      () => {
        return response.redirect(
          addQueryParams(redirectTo, {
            success: `Une invitation a bien été renvoyée à ${email}.`,
          })
        )
      },
      (e) => {
        return response.redirect(
          addQueryParams(redirectTo, {
            error:
              "L'invitation n'a pas pu être relancée pour une raison technique. Merci de réessayer.",
          })
        )
      }
    )
  })
)
