import { UniqueEntityID } from '../../core/domain'
import { makeUser } from '../../entities'
import makeFakeUser from '../../__tests__/fixtures/user'
import {
  ModificationRequestAccepted,
  ModificationRequested,
  ConfirmationRequested,
  ModificationRequestConfirmed,
} from './events'
import { StatusPreventsConfirmationError, TypePreventsConfirmationError } from './errors'
import { makeModificationRequest } from './ModificationRequest'
import { UnwrapForTest as OldUnwrapForTest } from '../../types'
import { UnwrapForTest } from '../../core/utils'

describe('Modification.confirm()', () => {
  const modificationRequestId = new UniqueEntityID()
  const projectId = new UniqueEntityID()
  const fakeUser = OldUnwrapForTest(makeUser(makeFakeUser()))
  const fakeResponseFileId = new UniqueEntityID().toString()

  describe('when demande of type abandon and status is en attente de confirmation', () => {
    const fakeModificationRequest = UnwrapForTest(
      makeModificationRequest({
        modificationRequestId,
        history: [
          new ModificationRequested({
            payload: {
              modificationRequestId: modificationRequestId.toString(),
              projectId: projectId.toString(),
              type: 'abandon',
              requestedBy: fakeUser.id,
            },
          }),
          new ConfirmationRequested({
            payload: {
              modificationRequestId: modificationRequestId.toString(),
              confirmationRequestedBy: fakeUser.id,
              responseFileId: '',
            },
          }),
        ],
      })
    )

    beforeAll(() => {
      expect(fakeModificationRequest.status).toEqual('en attente de confirmation')

      const res = fakeModificationRequest.confirm(fakeUser)
      expect(res.isOk()).toBe(true)
    })

    it('should emit ModificationRequestConfirmed', () => {
      expect(fakeModificationRequest.pendingEvents).not.toHaveLength(0)

      const targetEvent = fakeModificationRequest.pendingEvents.find(
        (item) => item.type === ModificationRequestConfirmed.type
      ) as ModificationRequestConfirmed | undefined
      expect(targetEvent).toBeDefined()
      if (!targetEvent) return

      expect(targetEvent.payload.modificationRequestId).toEqual(modificationRequestId.toString())
      expect(targetEvent.payload.confirmedBy).toEqual(fakeUser.id)
    })
  })

  describe('when demande status is not en attente de confirmation', () => {
    const fakeModificationRequest = UnwrapForTest(
      makeModificationRequest({
        modificationRequestId,
        history: [
          new ModificationRequested({
            payload: {
              modificationRequestId: modificationRequestId.toString(),
              projectId: projectId.toString(),
              type: 'abandon',
              requestedBy: fakeUser.id,
            },
          }),
          new ModificationRequestAccepted({
            payload: {
              modificationRequestId: modificationRequestId.toString(),
              acceptedBy: fakeUser.id,
              responseFileId: '',
            },
          }),
        ],
      })
    )

    it('should return StatusPreventsConfirmationError', () => {
      expect(fakeModificationRequest.status).toEqual('acceptée')

      const res = fakeModificationRequest.confirm(fakeUser)
      expect(res.isErr()).toBe(true)
      if (res.isOk()) return

      expect(res.error).toBeInstanceOf(StatusPreventsConfirmationError)
    })
  })
})
