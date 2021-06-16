import { combine, errAsync, fromOldResultAsync, okAsync, ResultAsync } from '../../../core/utils'
import { UserRepo } from '../../../dataAccess'
import { User } from '../../../entities'
import { UserProjectsLinkedByContactEmail } from '../../authorization'
import { EventBus } from '../../eventStore'
import { GetProjectsByContactEmail } from '../../project'
import { InfraNotAvailableError, UnauthorizedError } from '../../shared'
import { UserCreated } from '../events'
import { GetUserByEmail } from '../queries'

interface CreateUserDeps {
  getUserByEmail: GetUserByEmail
  getProjectsByContactEmail: GetProjectsByContactEmail
  createUserCredentials: (args: {
    role: User['role']
    email: string
  }) => ResultAsync<string, InfraNotAvailableError>
  eventBus: EventBus
}

interface CreateUserArgs {
  email: string
  fullName?: string
  role: User['role']
  createdBy?: User
}

export const makeCreateUser = (deps: CreateUserDeps) => (
  args: CreateUserArgs
): ResultAsync<string, UnauthorizedError | InfraNotAvailableError> => {
  const { getUserByEmail, createUserCredentials, getProjectsByContactEmail, eventBus } = deps
  const { email, role, createdBy, fullName } = args

  if (role === 'admin' || role === 'dgec') {
    return errAsync(new UnauthorizedError())
  }

  return getUserByEmail(email).andThen(
    (userOrNull): ResultAsync<string, InfraNotAvailableError> => {
      if (userOrNull !== null) {
        return okAsync(userOrNull.id)
      }

      return createUserCredentials({ role, email })
        .andThen((userId) =>
          eventBus
            .publish(
              new UserCreated({
                payload: { userId, email, fullName, role, createdBy: createdBy?.id },
              })
            )
            .map(() => userId)
        )
        .andThen((userId) => {
          return getProjectsByContactEmail(email)
            .andThen((projectIds) =>
              eventBus.publish(
                new UserProjectsLinkedByContactEmail({
                  payload: { userId, projectIds },
                })
              )
            )
            .map(() => userId)
        })
    }
  )
}
