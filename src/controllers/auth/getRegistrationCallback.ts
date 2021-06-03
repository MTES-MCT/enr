import asyncHandler from 'express-async-handler'
import { eventStore } from '../../config'
import { addQueryParams } from '../../helpers/addQueryParams'
import { UserRegistered } from '../../modules/users'
import routes from '../../routes'
import { v1Router } from '../v1Router'
import { ensureLoggedIn } from './authentication'

v1Router.get(
  routes.REGISTRATION_CALLBACK,
  ensureLoggedIn(),
  asyncHandler(async (request, response) => {
    const { user } = request

    await eventStore.publish(
      new UserRegistered({
        payload: {
          userId: user.id,
        },
      })
    )

    return response.redirect(
      addQueryParams(routes.USER_DASHBOARD, {
        success: 'Bienvenue sur Potentiel !',
      })
    )
  })
)
