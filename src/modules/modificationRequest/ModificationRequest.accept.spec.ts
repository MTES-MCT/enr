import { UniqueEntityID } from '../../core/domain'
import { makeUser } from '../../entities'
import makeFakeUser from '../../__tests__/fixtures/user'
import {
  ModificationRequested,
  ModificationRequestAccepted,
  ModificationRequestRejected,
  ModificationRequestConfirmed,
  ConfirmationRequested,
} from './events'
import { StatusPreventsAcceptingError } from './errors'
import { makeModificationRequest } from './ModificationRequest'
import { UnwrapForTest as OldUnwrapForTest } from '../../types'
import { UnwrapForTest } from '../../core/utils'

describe('Modification.acceptRecours()', () => {
  const modificationRequestId = new UniqueEntityID()
  const projectId = new UniqueEntityID()
  const responseFileId = new UniqueEntityID().toString()
  const fakeUser = OldUnwrapForTest(makeUser(makeFakeUser()))

  describe('when demande status is envoyée', () => {
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

    beforeAll(() => {
      expect(fakeModificationRequest.status).toEqual('envoyée')

      const res = fakeModificationRequest.accept({ acceptedBy: fakeUser, responseFileId })
      expect(res.isOk()).toBe(true)
    })

    it('should emit ModificationRequestAccepted', () => {
      expect(fakeModificationRequest.pendingEvents).not.toHaveLength(0)

      const targetEvent = fakeModificationRequest.pendingEvents.find(
        (item) => item.type === ModificationRequestAccepted.type
      ) as ModificationRequestAccepted | undefined
      expect(targetEvent).toBeDefined()
      if (!targetEvent) return

      expect(targetEvent.payload.modificationRequestId).toEqual(modificationRequestId.toString())
      expect(targetEvent.payload.responseFileId).toEqual(responseFileId)
    })
  })

  describe('when demande status is demande confirmée', () => {
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
          new ModificationRequestConfirmed({
            payload: {
              modificationRequestId: modificationRequestId.toString(),
              confirmedBy: fakeUser.id,
            },
          }),
        ],
      })
    )

    beforeAll(() => {
      expect(fakeModificationRequest.status).toEqual('demande confirmée')

      const res = fakeModificationRequest.accept({ acceptedBy: fakeUser, responseFileId })
      expect(res.isOk()).toBe(true)
    })

    it('should emit ModificationRequestAccepted', () => {
      expect(fakeModificationRequest.pendingEvents).not.toHaveLength(0)

      const targetEvent = fakeModificationRequest.pendingEvents.find(
        (item) => item.type === ModificationRequestAccepted.type
      ) as ModificationRequestAccepted | undefined
      expect(targetEvent).toBeDefined()
      if (!targetEvent) return

      expect(targetEvent.payload.modificationRequestId).toEqual(modificationRequestId.toString())
      expect(targetEvent.payload.responseFileId).toEqual(responseFileId)
    })
  })

  describe('when demande status is en attente de confirmation', () => {
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

      const res = fakeModificationRequest.accept({ acceptedBy: fakeUser, responseFileId })
      expect(res.isOk()).toBe(true)
    })

    it('should emit ModificationRequestAccepted', () => {
      expect(fakeModificationRequest.pendingEvents).not.toHaveLength(0)

      const targetEvent = fakeModificationRequest.pendingEvents.find(
        (item) => item.type === ModificationRequestAccepted.type
      ) as ModificationRequestAccepted | undefined
      expect(targetEvent).toBeDefined()
      if (!targetEvent) return

      expect(targetEvent.payload.modificationRequestId).toEqual(modificationRequestId.toString())
      expect(targetEvent.payload.responseFileId).toEqual(responseFileId)
    })
  })

  describe('when demande status is acceptée', () => {
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

    it('should return StatusPreventsAcceptingError', () => {
      expect(fakeModificationRequest.status).toEqual('acceptée')

      const res = fakeModificationRequest.accept({ acceptedBy: fakeUser, responseFileId })
      expect(res.isErr()).toBe(true)
      if (res.isOk()) return

      expect(res.error).toBeInstanceOf(StatusPreventsAcceptingError)
    })
  })

  describe('when demande status is rejetée', () => {
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
          new ModificationRequestRejected({
            payload: {
              modificationRequestId: modificationRequestId.toString(),
              rejectedBy: fakeUser.id,
              responseFileId: '',
            },
          }),
        ],
      })
    )

    it('should return StatusPreventsAcceptingError', () => {
      expect(fakeModificationRequest.status).toEqual('rejetée')

      const res = fakeModificationRequest.accept({ acceptedBy: fakeUser, responseFileId })
      expect(res.isErr()).toBe(true)
      if (res.isOk()) return

      expect(res.error).toBeInstanceOf(StatusPreventsAcceptingError)
    })
  })
})
