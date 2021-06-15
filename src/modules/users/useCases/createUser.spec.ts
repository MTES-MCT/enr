import { DomainEvent, UniqueEntityID } from '../../../core/domain'
import { okAsync } from '../../../core/utils'
import { User } from '../../../entities'
import makeFakeUser from '../../../__tests__/fixtures/user'
import { InfraNotAvailableError, UnauthorizedError } from '../../shared'
import { UserCreated } from '../events'
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
    const eventBus = {
      publish: jest.fn((event: DomainEvent) => okAsync<null, InfraNotAvailableError>(null)),
      subscribe: jest.fn(),
    }

    const createUser = makeCreateUser({
      getUserByEmail,
      createUserCredentials,
      eventBus,
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

    it('emit UserCreated', () => {
      expect(eventBus.publish).toHaveBeenCalled()
      const event = eventBus.publish.mock.calls[0][0]
      expect(event).toBeDefined()
      expect(event).toBeInstanceOf(UserCreated)
      expect(event.payload.userId).toEqual(newUserId)
      expect(event.payload.role).toEqual('porteur-projet')
    })
  })

  describe('when invited email is an existing user', () => {
    const userWithEmail: User = makeFakeUser({ id: new UniqueEntityID().toString() })
    const getUserByEmail = jest.fn((email: string) =>
      okAsync<User | null, InfraNotAvailableError>(userWithEmail)
    )
    const createUserCredentials = jest.fn()

    const eventBus = {
      publish: jest.fn((event: DomainEvent) => okAsync<null, InfraNotAvailableError>(null)),
      subscribe: jest.fn(),
    }

    const createUser = makeCreateUser({
      getUserByEmail,
      createUserCredentials,
      eventBus,
    })

    it('should return the existing user id', async () => {
      const res = await createUser({
        email: fakeEmail,
        role: 'porteur-projet',
      })
      expect(res.isOk()).toBe(true)
      expect(res._unsafeUnwrap()).toEqual(userWithEmail.id)

      expect(createUserCredentials).not.toHaveBeenCalled()
      expect(eventBus.publish).not.toHaveBeenCalled()
    })
  })

  describe('when new user role is admin', () => {
    const getUserByEmail = jest.fn()
    const createUserCredentials = jest.fn()
    const saveUser = jest.fn()
    const eventBus = {
      publish: jest.fn(),
      subscribe: jest.fn(),
    }

    const createUser = makeCreateUser({
      getUserByEmail,
      createUserCredentials,
      eventBus,
    })

    it('should return UnauthorizedError', async () => {
      const res = await createUser({
        email: fakeEmail,
        role: 'admin',
      })
      expect(res.isErr()).toBe(true)
      expect(res._unsafeUnwrapErr()).toBeInstanceOf(UnauthorizedError)

      expect(createUserCredentials).not.toHaveBeenCalled()
      expect(eventBus.publish).not.toHaveBeenCalled()
    })
  })

  describe('when new user role is dgec', () => {
    const getUserByEmail = jest.fn()
    const createUserCredentials = jest.fn()
    const eventBus = {
      publish: jest.fn(),
      subscribe: jest.fn(),
    }

    const createUser = makeCreateUser({
      getUserByEmail,
      createUserCredentials,
      eventBus,
    })

    it('should return UnauthorizedError', async () => {
      const res = await createUser({
        email: fakeEmail,
        role: 'dgec',
      })
      expect(res.isErr()).toBe(true)
      expect(res._unsafeUnwrapErr()).toBeInstanceOf(UnauthorizedError)

      expect(createUserCredentials).not.toHaveBeenCalled()
      expect(eventBus.publish).not.toHaveBeenCalled()
    })
  })
})
