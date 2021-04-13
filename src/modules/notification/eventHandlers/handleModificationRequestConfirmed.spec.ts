import { okAsync } from 'neverthrow'
import { NotificationArgs } from '..'
import { UniqueEntityID } from '../../../core/domain'
import { makeUser } from '../../../entities'
import { UnwrapForTest } from '../../../types'
import makeFakeUser from '../../../__tests__/fixtures/user'
import {
  GetModificationRequestInfoForConfirmedNotification,
  ModificationRequestConfirmed,
} from '../../modificationRequest'
import { handleModificationRequestConfirmed } from './handleModificationRequestConfirmed'

const modificationRequestId = new UniqueEntityID().toString()

describe('notification.handleModificationRequestConfirmed', () => {
  const chargeAffaire = UnwrapForTest(
    makeUser(makeFakeUser({ role: 'admin', email: 'admin@test.test', fullName: 'admin1' }))
  )

  const sendNotification = jest.fn(async (args: NotificationArgs) => null)
  const getModificationRequestInfoForConfirmedNotification = jest.fn((modificationRequestId) =>
    okAsync({
      chargeAffaire: { email: 'admin@test.test', fullName: 'admin1', id: chargeAffaire.id },
      nomProjet: 'nomProjet',
      type: 'abandon',
    })
  ) as GetModificationRequestInfoForConfirmedNotification

  it('should call sendNotification for the chargé d‘affaire which requested the confirmation', async () => {
    sendNotification.mockClear()

    await handleModificationRequestConfirmed({
      sendNotification,
      getModificationRequestInfoForConfirmedNotification,
    })(
      new ModificationRequestConfirmed({
        payload: { modificationRequestId, confirmedBy: '' },
      })
    )

    expect(getModificationRequestInfoForConfirmedNotification).toHaveBeenCalledWith(
      modificationRequestId
    )

    expect(sendNotification).toHaveBeenCalledTimes(1)
    const notification = sendNotification.mock.calls[0][0]

    expect(notification.message.email).toEqual('admin@test.test')

    expect(
      notification.type === 'modification-request-confirmed' &&
        notification.variables.nom_projet === 'nomProjet' &&
        notification.variables.type_demande === 'abandon'
    ).toBe(true)
  })
})
