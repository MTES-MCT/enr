import { UniqueEntityID } from '../../../core/domain'
import { okAsync } from '../../../core/utils'
import { User } from '../../../entities'
import makeFakeUser from '../../../__tests__/fixtures/user'
import { InfraNotAvailableError, UnauthorizedError } from '../../shared'
import { UserWithEmailExistsAlreadyError } from '../errors'
import { makeCreateUser } from './createUser'

describe('createUser use-case', () => {
  const fakeEmail = 'test@test.test'

  describe('when invited email is not an existing user', () => {
    const newUserId = new UniqueEntityID().toString()
    const getUserByEmail = jest.fn((email: string) =>
      okAsync<User | null, InfraNotAvailableError>(null)
    )
    const createUserCredentials = jest.fn((args: { role: User['role']; email: string }) =>
      okAsync<string, InfraNotAvailableError>(newUserId)
    )
    const saveUser = jest.fn((user: User) => okAsync<null, InfraNotAvailableError>(null))

    const createUser = makeCreateUser({
      getUserByEmail,
      createUserCredentials,
      saveUser,
    })

    beforeAll(async () => {
      const res = await createUser({
        email: fakeEmail,
        role: 'porteur-projet',
      })
      expect(res.isOk()).toBe(true)
      expect(res._unsafeUnwrap()).toEqual(newUserId)
    })

    it('should create new credentials for this email', () => {
      expect(createUserCredentials).toHaveBeenCalledWith({
        role: 'porteur-projet',
        email: fakeEmail,
      })
    })

    it('create and save a new user', () => {
      expect(saveUser).toHaveBeenCalled()
      const newUser = saveUser.mock.calls[0][0]
      expect(newUser).toBeDefined()
      expect(newUser.id).toEqual(newUserId)
      expect(newUser.role).toEqual('porteur-projet')
    })
  })

  describe('when invited email is an existing user', () => {
    const userWithEmail: User = makeFakeUser({ id: new UniqueEntityID().toString() })
    const getUserByEmail = jest.fn((email: string) =>
      okAsync<User | null, InfraNotAvailableError>(userWithEmail)
    )
    const createUserCredentials = jest.fn()
    const saveUser = jest.fn()

    const createUser = makeCreateUser({
      getUserByEmail,
      createUserCredentials,
      saveUser,
    })

    it('should return UserWithEmailExistsAlreadyError', async () => {
      const res = await createUser({
        email: fakeEmail,
        role: 'porteur-projet',
      })
      expect(res.isErr()).toBe(true)
      expect(res._unsafeUnwrapErr()).toBeInstanceOf(UserWithEmailExistsAlreadyError)

      expect(createUserCredentials).not.toHaveBeenCalled()
      expect(saveUser).not.toHaveBeenCalled()
    })
  })

  describe('when new user role is admin', () => {
    const getUserByEmail = jest.fn()
    const createUserCredentials = jest.fn()
    const saveUser = jest.fn()

    const createUser = makeCreateUser({
      getUserByEmail,
      createUserCredentials,
      saveUser,
    })

    it('should return UnauthorizedError', async () => {
      const res = await createUser({
        email: fakeEmail,
        role: 'admin',
      })
      expect(res.isErr()).toBe(true)
      expect(res._unsafeUnwrapErr()).toBeInstanceOf(UnauthorizedError)

      expect(createUserCredentials).not.toHaveBeenCalled()
      expect(saveUser).not.toHaveBeenCalled()
    })
  })

  describe('when new user role is dgec', () => {
    const getUserByEmail = jest.fn()
    const createUserCredentials = jest.fn()
    const saveUser = jest.fn()

    const createUser = makeCreateUser({
      getUserByEmail,
      createUserCredentials,
      saveUser,
    })

    it('should return UnauthorizedError', async () => {
      const res = await createUser({
        email: fakeEmail,
        role: 'dgec',
      })
      expect(res.isErr()).toBe(true)
      expect(res._unsafeUnwrapErr()).toBeInstanceOf(UnauthorizedError)

      expect(createUserCredentials).not.toHaveBeenCalled()
      expect(saveUser).not.toHaveBeenCalled()
    })
  })

  // describe('when trying to create an admin user')
})
