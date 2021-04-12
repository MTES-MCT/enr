import { UniqueEntityID } from '../../core/domain'
import { makeUser } from '../../entities'
import makeFakeUser from '../../__tests__/fixtures/user'
import { ModificationRequestAccepted, ModificationRequested, ConfirmationRequested } from './events'
import { StatusPreventsConfirmationError, TypePreventsConfirmationError } from './errors'
import { makeModificationRequest } from './ModificationRequest'
import { UnwrapForTest as OldUnwrapForTest } from '../../types'
import { UnwrapForTest } from '../../core/utils'

describe('Modification.requestConfirmation()', () => {
  const modificationRequestId = new UniqueEntityID()
  const projectId = new UniqueEntityID()
  const fakeUser = OldUnwrapForTest(makeUser(makeFakeUser()))
  const fakeResponseFileId = new UniqueEntityID().toString()

  describe('when demande of type abandon and status is envoyée', () => {
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
        ],
      })
    )

    beforeAll(() => {
      expect(fakeModificationRequest.status).toEqual('envoyée')

      const res = fakeModificationRequest.requestConfirmation(fakeUser, fakeResponseFileId)
      expect(res.isOk()).toBe(true)
    })

    it('should emit ConfirmationRequested', () => {
      expect(fakeModificationRequest.pendingEvents).not.toHaveLength(0)

      const targetEvent = fakeModificationRequest.pendingEvents.find(
        (item) => item.type === ConfirmationRequested.type
      ) as ConfirmationRequested | undefined
      expect(targetEvent).toBeDefined()
      if (!targetEvent) return

      expect(targetEvent.payload.modificationRequestId).toEqual(modificationRequestId.toString())
      expect(targetEvent.payload.confirmationRequestedBy).toEqual(fakeUser.id)
      expect(targetEvent.payload.responseFileId).toEqual(fakeResponseFileId)
    })
  })

  describe('when demande status is not envoyée', () => {
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

      const res = fakeModificationRequest.requestConfirmation(fakeUser, fakeResponseFileId)
      expect(res.isErr()).toBe(true)
      if (res.isOk()) return

      expect(res.error).toBeInstanceOf(StatusPreventsConfirmationError)
    })
  })

  describe('when demande is not of type abandon', () => {
    const fakeModificationRequest = UnwrapForTest(
      makeModificationRequest({
        modificationRequestId,
        history: [
          new ModificationRequested({
            payload: {
              modificationRequestId: modificationRequestId.toString(),
              projectId: projectId.toString(),
              type: 'recours',
              requestedBy: fakeUser.id,
            },
          }),
        ],
      })
    )

    it('should return TypePreventsConfirmationError', () => {
      const res = fakeModificationRequest.requestConfirmation(fakeUser, fakeResponseFileId)
      expect(res.isErr()).toBe(true)
      if (res.isOk()) return

      expect(res.error).toBeInstanceOf(TypePreventsConfirmationError)
    })
  })
})
