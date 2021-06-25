import { TransactionalRepository, UniqueEntityID } from '../../../core/domain'
import { ResultAsync } from '../../../core/utils'
import { InfraNotAvailableError, OtherError } from '../../shared'
import { User } from '../User'

interface RegisterFirstUserLoginDeps {
  userRepo: TransactionalRepository<User>
  getUserName: (keycloakId: string) => ResultAsync<string, OtherError>
}

interface RegisterFirstUserLoginArgs {
  userId: string
  keycloakId: string
}

export const makeRegisterFirstUserLogin = (deps: RegisterFirstUserLoginDeps) => (
  args: RegisterFirstUserLoginArgs
): ResultAsync<null, InfraNotAvailableError> => {
  const { userRepo, getUserName } = deps
  const { userId, keycloakId } = args

  return userRepo.transaction(new UniqueEntityID(userId), (user) => {
    return getUserName(keycloakId).andThen((fullName) => user.registerFirstLogin({ fullName }))
  })
}
