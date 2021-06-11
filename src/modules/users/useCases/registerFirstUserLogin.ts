import { TransactionalRepository, UniqueEntityID } from '../../../core/domain'
import { ResultAsync } from '../../../core/utils'
import { InfraNotAvailableError } from '../../shared'
import { User } from '../User'

interface RegisterFirstUserLoginDeps {
  userRepo: TransactionalRepository<User>
}

interface RegisterFirstUserLoginArgs {
  userId: string
  fullName: string
}

export const makeRegisterFirstUserLogin = (deps: RegisterFirstUserLoginDeps) => (
  args: RegisterFirstUserLoginArgs
): ResultAsync<null, InfraNotAvailableError> => {
  const { userRepo } = deps
  const { userId, fullName } = args

  return userRepo.transaction(new UniqueEntityID(userId), (user) => {
    return user.registerFirstLogin({ fullName })
  })
}
