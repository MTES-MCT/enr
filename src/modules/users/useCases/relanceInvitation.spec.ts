import { DomainEvent } from '../../../core/domain'
import { okAsync } from '../../../core/utils'
import makeFakeUser from '../../../__tests__/fixtures/user'
import { InfraNotAvailableError } from '../../shared'
import { InvitationRelanceSent } from '../events'
import { makeRelanceInvitation } from './relanceInvitation'

describe('relanceInvitation use-case', () => {
  const fakeEmail = 'test@test.test'

  const admin = makeFakeUser({ role: 'admin' })
  const resendInvitationEmail = jest.fn((email: string) =>
    okAsync<null, InfraNotAvailableError>(null)
  )

  const eventBus = {
    publish: jest.fn((event: DomainEvent) => okAsync<null, InfraNotAvailableError>(null)),
    subscribe: jest.fn(),
  }

  const relanceInvitation = makeRelanceInvitation({ resendInvitationEmail, eventBus })

  beforeAll(async () => {
    const res = await relanceInvitation({
      relanceBy: admin,
      email: fakeEmail,
    })

    expect(res.isOk()).toBe(true)
  })

  it('should send a new email invitation to user', async () => {
    expect(resendInvitationEmail).toHaveBeenCalledWith(fakeEmail)
  })
  it('should emit InvitationRelanceSent', async () => {
    expect(eventBus.publish).toHaveBeenCalledTimes(1)
    const event = eventBus.publish.mock.calls[0][0]

    expect(event).toBeInstanceOf(InvitationRelanceSent)

    expect(event.payload).toMatchObject({
      email: fakeEmail,
      relanceBy: admin.id,
    })
  })
})
