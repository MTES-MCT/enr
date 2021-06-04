import asyncHandler from 'express-async-handler'
import { eventStore } from '../../config'
import { addQueryParams } from '../../helpers/addQueryParams'
import { getUserName } from '../../infra/keycloak'
import { UserRegistered } from '../../modules/users'
import routes from '../../routes'
import { v1Router } from '../v1Router'
import { ensureLoggedIn } from './authentication'

v1Router.get(
  routes.REGISTRATION_CALLBACK,
  ensureLoggedIn(),
  asyncHandler(async (request, response) => {
    const { user } = request

    await getUserName(user.id).andThen((fullName) => {
      return eventStore.publish(
        new UserRegistered({
          payload: {
            userId: user.id,
            fullName,
          },
        })
      )
    })

    return response.redirect(
      addQueryParams(routes.USER_DASHBOARD, {
        success: 'Bienvenue sur Potentiel !',
      })
    )
  })
)
