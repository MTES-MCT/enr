import { errAsync, okAsync, ResultAsync } from '../../../core/utils'
import { User } from '../../../entities'
import { EventBus } from '../../eventStore'
import { InfraNotAvailableError, UnauthorizedError } from '../../shared'
import { UserCreated } from '../events'
import { GetUserByEmail } from '../queries'

interface CreateUserDeps {
  getUserByEmail: GetUserByEmail
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
  const { getUserByEmail, createUserCredentials, eventBus } = deps
  const { email, role, createdBy, fullName } = args

  if (role === 'admin' || role === 'dgec') {
    return errAsync(new UnauthorizedError())
  }

  return getUserByEmail(email).andThen(
    (userOrNull): ResultAsync<string, InfraNotAvailableError> => {
      if (userOrNull !== null) {
        return okAsync(userOrNull.id)
      }

      return createUserCredentials({ role, email }).andThen((userId) =>
        eventBus
          .publish(
            new UserCreated({
              payload: { userId, email, fullName, role, createdBy: createdBy?.id },
            })
          )
          .map(() => userId)
      )
    }
  )
}
