import { ok, Result, wrapInfra } from '../../../core/utils'
import { User } from '../../../entities'
import { InfraNotAvailableError } from '../../../modules/shared'
import { GetUserByEmail } from '../../../modules/users/queries'

export const makeGetUserByEmail = (models): GetUserByEmail => (email) => {
  const { User } = models

  return wrapInfra(User.findOne({ where: { email } })).andThen(
    (userRaw: any): Result<User | null, InfraNotAvailableError> => {
      if (!userRaw) return ok(null)

      const user = userRaw.get()
      user.isRegistered = !!user.registeredOn

      return ok(user)
    }
  )
}
