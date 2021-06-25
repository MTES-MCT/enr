import { UniqueEntityID } from '../../../core/domain'
import { logger, okAsync } from '../../../core/utils'
import { fakeTransactionalRepo, makeFakeUser } from '../../../__tests__/fixtures/aggregates'
import { OtherError } from '../../shared'
import { User } from '../User'
import { makeRegisterFirstUserLogin } from './registerFirstUserLogin'

describe('registerFirstUserLogin use-case', () => {
  describe('when user has rights to this project', () => {
    const fakeUser = {
      ...makeFakeUser(),
    }
    const keycloakId = new UniqueEntityID().toString()
    const userRepo = fakeTransactionalRepo(fakeUser as User)
    const getUserName = jest.fn((keycloakId: string) => okAsync<string, OtherError>('full name'))

    const registerFirstUserLogin = makeRegisterFirstUserLogin({
      userRepo,
      getUserName,
    })

    beforeAll(async () => {
      const res = await registerFirstUserLogin({
        userId: fakeUser.id.toString(),
        keycloakId,
      })

      if (res.isErr()) logger.error(res.error)
      expect(res.isOk()).toEqual(true)

      expect(getUserName).toHaveBeenCalledWith(keycloakId)
    })

    it('should call registerFirstLogin on user', () => {
      expect(fakeUser.registerFirstLogin).toHaveBeenCalledTimes(1)
      expect(fakeUser.registerFirstLogin).toHaveBeenCalledWith({ fullName: 'full name' })
    })
  })
})
