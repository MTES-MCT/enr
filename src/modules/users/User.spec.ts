import { UniqueEntityID } from '../../core/domain'
import { UserCreated, UserRegistered } from './events'
import { makeUser } from './User'

const userId = new UniqueEntityID()

describe('User.registerFirstLogin()', () => {
  describe('when user is not registered yet', () => {
    const user = makeUser({
      id: userId,
      events: [
        new UserCreated({
          payload: {
            userId: userId.toString(),
            email: 'test@test.test',
            role: 'porteur-projet',
          },
        }),
      ],
    })._unsafeUnwrap()

    it('should emit UserRegistered', () => {
      const res = user.registerFirstLogin({ fullName: 'full name' })

      expect(res.isOk()).toBe(true)

      expect(user.pendingEvents).toHaveLength(1)
      const event = user.pendingEvents[0]
      expect(event).toBeInstanceOf(UserRegistered)
      expect(event.payload).toMatchObject({
        userId: userId.toString(),
        fullName: 'full name',
      })
    })
  })

  describe('when user is already registered', () => {
    const user = makeUser({
      id: userId,
      events: [
        new UserCreated({
          payload: {
            userId: userId.toString(),
            email: 'test@test.test',
            role: 'porteur-projet',
          },
        }),
        new UserRegistered({
          payload: {
            userId: userId.toString(),
            fullName: 'full name',
          },
        }),
      ],
    })._unsafeUnwrap()

    it('should not emit', () => {
      const res = user.registerFirstLogin({ fullName: 'full name' })

      expect(res.isOk()).toBe(true)

      expect(user.pendingEvents).toHaveLength(0)
    })
  })
})
