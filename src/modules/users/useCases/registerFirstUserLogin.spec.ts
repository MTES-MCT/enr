import { logger } from '../../../core/utils'
import { fakeTransactionalRepo, makeFakeUser } from '../../../__tests__/fixtures/aggregates'
import { User } from '../User'
import { makeRegisterFirstUserLogin } from './registerFirstUserLogin'

describe('registerFirstUserLogin use-case', () => {
  describe('when user has rights to this project', () => {
    const fakeUser = {
      ...makeFakeUser(),
    }
    const userRepo = fakeTransactionalRepo(fakeUser as User)

    const registerFirstUserLogin = makeRegisterFirstUserLogin({
      userRepo,
    })

    beforeAll(async () => {
      const res = await registerFirstUserLogin({
        userId: fakeUser.id.toString(),
        fullName: 'full name',
      })

      if (res.isErr()) logger.error(res.error)
      expect(res.isOk()).toEqual(true)
    })

    it('should call registerFirstLogin on user', () => {
      expect(fakeUser.registerFirstLogin).toHaveBeenCalledTimes(1)
      expect(fakeUser.registerFirstLogin).toHaveBeenCalledWith({ fullName: 'full name' })
    })
  })
})
