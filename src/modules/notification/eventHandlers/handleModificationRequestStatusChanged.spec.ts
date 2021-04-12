import { okAsync } from 'neverthrow'
import { NotificationArgs } from '..'
import { UniqueEntityID } from '../../../core/domain'
import { makeUser } from '../../../entities'
import { UnwrapForTest } from '../../../types'
import makeFakeUser from '../../../__tests__/fixtures/user'
import {
  ConfirmationRequested,
  GetModificationRequestInfoForStatusNotification,
  ModificationRequestAccepted,
  ModificationRequestInstructionStarted,
  ModificationRequestRejected,
} from '../../modificationRequest'
import { handleModificationRequestStatusChanged } from './handleModificationRequestStatusChanged'

const modificationRequestId = new UniqueEntityID().toString()

describe('notification.handleModificationRequestStatusChanged', () => {
  const projectUsers = ['email1@test.test', 'email1@test.test'].map((email) =>
    UnwrapForTest(makeUser(makeFakeUser({ role: 'porteur-projet', email })))
  )

  const sendNotification = jest.fn(async (args: NotificationArgs) => null)
  const getModificationRequestInfoForStatusNotification = jest.fn((modificationRequestId) =>
    okAsync({
      porteursProjet: projectUsers.map(({ email, fullName, id }) => ({ email, fullName, id })),
      nomProjet: 'nomProjet',
      type: 'recours',
    })
  ) as GetModificationRequestInfoForStatusNotification

  describe('in all cases', () => {
    it('should call sendNotification for each user that has rights to this project', async () => {
      sendNotification.mockClear()

      await handleModificationRequestStatusChanged({
        sendNotification,
        getModificationRequestInfoForStatusNotification,
      })(
        new ModificationRequestAccepted({
          payload: { modificationRequestId, acceptedBy: '', responseFileId: '' },
        })
      )

      expect(getModificationRequestInfoForStatusNotification).toHaveBeenCalledWith(
        modificationRequestId
      )

      expect(sendNotification).toHaveBeenCalledTimes(projectUsers.length)
      const notifications = sendNotification.mock.calls.map((call) => call[0])

      expect(notifications.map((notification) => notification.message.email)).toEqual(
        projectUsers.map((user) => user.email)
      )
      expect(
        notifications.every(
          (notification) =>
            notification.type === 'modification-request-status-update' &&
            notification.variables.nom_projet === 'nomProjet' &&
            notification.variables.type_demande === 'recours'
        )
      ).toBe(true)
    })
  })

  describe('when triggered with ModificationRequestAccepted', () => {
    it('should set the status in the email to acceptée and mention a document', async () => {
      sendNotification.mockClear()

      await handleModificationRequestStatusChanged({
        sendNotification,
        getModificationRequestInfoForStatusNotification,
      })(
        new ModificationRequestAccepted({
          payload: { modificationRequestId, acceptedBy: '', responseFileId: '' },
        })
      )

      const notifications = sendNotification.mock.calls.map((call) => call[0])
      expect(
        notifications.every(
          (notification) =>
            notification.type === 'modification-request-status-update' &&
            notification.variables.status === 'acceptée' &&
            notification.variables.document_absent === undefined
        )
      ).toBe(true)
    })
  })

  describe('when triggered with ModificationRequestRejected', () => {
    it('should set the status in the email to acceptée and mention a document', async () => {
      sendNotification.mockClear()

      await handleModificationRequestStatusChanged({
        sendNotification,
        getModificationRequestInfoForStatusNotification,
      })(
        new ModificationRequestRejected({
          payload: { modificationRequestId, rejectedBy: '', responseFileId: '' },
        })
      )

      const notifications = sendNotification.mock.calls.map((call) => call[0])
      expect(
        notifications.every(
          (notification) =>
            notification.type === 'modification-request-status-update' &&
            notification.variables.status === 'rejetée' &&
            notification.variables.document_absent === undefined
        )
      ).toBe(true)
    })
  })

  describe('when triggered with ModificationRequestInstructionStarted', () => {
    it('should set the status in the email to en instruction and not mention a document', async () => {
      sendNotification.mockClear()

      await handleModificationRequestStatusChanged({
        sendNotification,
        getModificationRequestInfoForStatusNotification,
      })(
        new ModificationRequestInstructionStarted({
          payload: { modificationRequestId },
        })
      )

      const notifications = sendNotification.mock.calls.map((call) => call[0])
      expect(
        notifications.every(
          (notification) =>
            notification.type === 'modification-request-status-update' &&
            notification.variables.status === 'en instruction' &&
            notification.variables.document_absent === ''
        )
      ).toBe(true)
    })
  })

  describe('when triggered with ConfirmationRequested', () => {
    it('should set the status in the email to en attente de confirmation and mention a document', async () => {
      sendNotification.mockClear()

      await handleModificationRequestStatusChanged({
        sendNotification,
        getModificationRequestInfoForStatusNotification,
      })(
        new ConfirmationRequested({
          payload: { modificationRequestId, confirmationRequestedBy: '', responseFileId: '' },
        })
      )

      const notifications = sendNotification.mock.calls.map((call) => call[0])
      expect(
        notifications.every(
          (notification) =>
            notification.type === 'modification-request-status-update' &&
            notification.variables.status === 'en attente de confirmation' &&
            notification.variables.document_absent === undefined
        )
      ).toBe(true)
    })
  })
})
