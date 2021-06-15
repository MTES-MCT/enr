import asyncHandler from 'express-async-handler'
import { createUser, eventStore } from '../../config'
import { REGIONS } from '../../entities'
import { addQueryParams } from '../../helpers/addQueryParams'
import { DrealUserInvited } from '../../modules/authorization'
import { PartnerUserInvited } from '../../modules/authorization/events/PartnerUserInvited'
import routes from '../../routes'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'

v1Router.post(
  routes.ADMIN_INVITE_USER_ACTION,
  ensureRole('admin'),
  asyncHandler(async (request, response) => {
    const { email, role, region } = request.body

    const redirectTo = request.get('Referrer')

    if (!['acheteur-obligé', 'dreal'].includes(role)) {
      return response.redirect(
        addQueryParams(redirectTo, {
          error: 'Le role attendu n‘est pas reconnu.',
        })
      )
    }

    if (role === 'dreal' && !REGIONS.includes(region)) {
      return response.redirect(
        addQueryParams(redirectTo, {
          error: 'Cette DREAL n‘est pas reconnue.',
        })
      )
    }

    ;(
      await createUser({
        email: email.toLowerCase(),
        role,
        createdBy: request.user,
      }).andThen((userId) => {
        if (role === 'dreal') {
          return eventStore.publish(
            new DrealUserInvited({
              payload: {
                userId,
                region,
                invitedBy: request.user.id,
              },
            })
          )
        }

        return eventStore.publish(
          new PartnerUserInvited({
            payload: {
              userId,
              role,
              invitedBy: request.user.id,
            },
          })
        )
      })
    ).match(
      () =>
        response.redirect(
          addQueryParams(redirectTo, {
            success: `Une invitation a bien été envoyée à ${email}`,
          })
        ),
      (error: Error) =>
        response.redirect(
          addQueryParams(redirectTo, {
            error: error.message,
          })
        )
    )
  })
)
