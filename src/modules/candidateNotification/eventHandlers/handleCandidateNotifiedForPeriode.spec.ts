import { UniqueEntityID } from '../../../core/domain'
import { okAsync } from '../../../core/utils'
import { User } from '../../../entities'
import makeFakeUser from '../../../__tests__/fixtures/user'
import { GetPeriodeTitle } from '../../appelOffre'
import { NotificationArgs } from '../../notification'
import { InfraNotAvailableError } from '../../shared'
import { CandidateNotifiedForPeriode } from '../events'
import { handleCandidateNotifiedForPeriode } from './handleCandidateNotifiedForPeriode'

const fakePayload = {
  periodeId: 'periode1',
  appelOffreId: 'appelOffre1',
  candidateEmail: 'email1@test.test',
  candidateName: 'name',
}

describe('handleCandidateNotifiedForPeriode', () => {
  describe('if user exists', () => {
    const sendNotification = jest.fn(async (args: NotificationArgs) => null)
    const getPeriodeTitle = (jest.fn((appelOffreId, periodeId) =>
      okAsync({
        periodeTitle: 'periode1title',
        appelOffreTitle: 'appelOffre1title',
      })
    ) as unknown) as GetPeriodeTitle

    const userWithEmail: User = makeFakeUser({ id: new UniqueEntityID().toString() })
    const getUserByEmail = jest.fn((email: string) =>
      okAsync<User | null, InfraNotAvailableError>(userWithEmail)
    )

    const createUser = jest.fn()

    beforeAll(async () => {
      await handleCandidateNotifiedForPeriode({
        sendNotification,
        getUserByEmail,
        createUser,
        getPeriodeTitle,
      })(
        new CandidateNotifiedForPeriode({
          payload: { ...fakePayload },
          requestId: 'request1',
        })
      )
    })

    it('should send a designation notification to the candidate', () => {
      expect(sendNotification).toHaveBeenCalledTimes(1)
      const notificationArgs = sendNotification.mock.calls[0][0]

      expect(notificationArgs.type).toEqual('designation')
      expect(notificationArgs.message.email).toEqual(fakePayload.candidateEmail)
      expect(notificationArgs.message.name).toEqual(fakePayload.candidateName)
      expect(notificationArgs.message.subject).toContain('periode1title')
      expect(notificationArgs.message.subject).toContain('appelOffre1title')

      expect(createUser).not.toHaveBeenCalled()
    })
  })

  describe('if user does not exist', () => {
    const sendNotification = jest.fn()
    const getPeriodeTitle = jest.fn()

    const getUserByEmail = jest.fn((email: string) =>
      okAsync<User | null, InfraNotAvailableError>(null)
    )

    const newUserId = new UniqueEntityID().toString()
    const createUser = jest.fn((args: { role: User['role']; email: string }) =>
      okAsync<string, InfraNotAvailableError>(newUserId)
    )

    beforeAll(async () => {
      await handleCandidateNotifiedForPeriode({
        sendNotification,
        getUserByEmail,
        createUser,
        getPeriodeTitle,
      })(
        new CandidateNotifiedForPeriode({
          payload: { ...fakePayload },
          requestId: 'request1',
        })
      )
    })

    it('create a new account for the candidate', () => {
      expect(createUser).toHaveBeenCalledWith({
        role: 'porteur-projet',
        email: fakePayload.candidateEmail,
        fullName: fakePayload.candidateName,
      })

      expect(sendNotification).not.toHaveBeenCalled()
    })
  })
})
