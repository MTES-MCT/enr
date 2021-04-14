import { UniqueEntityID } from '../../core/domain'
import { makeUser } from '../../entities'
import makeFakeUser from '../../__tests__/fixtures/user'
import {
  ConfirmationRequested,
  ModificationRequestAccepted,
  ModificationRequestConfirmed,
  ModificationRequested,
  ModificationRequestRejected,
} from './events'
import { StatusPreventsRejectingError } from './errors'
import { makeModificationRequest } from './ModificationRequest'
import { UnwrapForTest as OldUnwrapForTest } from '../../types'
import { UnwrapForTest } from '../../core/utils'

describe('Modification.reject()', () => {
  const modificationRequestId = new UniqueEntityID()
  const projectId = new UniqueEntityID()
  const fakeUser = OldUnwrapForTest(makeUser(makeFakeUser()))
  const fakeResponseFileId = new UniqueEntityID().toString()

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

      const res = fakeModificationRequest.reject(fakeUser, fakeResponseFileId)
      expect(res.isOk()).toBe(true)
    })

    it('should emit ModificationRequestRejected', () => {
      expect(fakeModificationRequest.pendingEvents).not.toHaveLength(0)

      const targetEvent = fakeModificationRequest.pendingEvents.find(
        (item) => item.type === ModificationRequestRejected.type
      ) as ModificationRequestRejected | undefined
      expect(targetEvent).toBeDefined()
      if (!targetEvent) return

      expect(targetEvent.payload.modificationRequestId).toEqual(modificationRequestId.toString())
      expect(targetEvent.payload.rejectedBy).toEqual(fakeUser.id)
      expect(targetEvent.payload.responseFileId).toEqual(fakeResponseFileId)
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

      const res = fakeModificationRequest.reject(fakeUser, fakeResponseFileId)
      expect(res.isOk()).toBe(true)
    })

    it('should emit ModificationRequestRejected', () => {
      expect(fakeModificationRequest.pendingEvents).not.toHaveLength(0)

      const targetEvent = fakeModificationRequest.pendingEvents.find(
        (item) => item.type === ModificationRequestRejected.type
      ) as ModificationRequestRejected | undefined
      expect(targetEvent).toBeDefined()
      if (!targetEvent) return

      expect(targetEvent.payload.modificationRequestId).toEqual(modificationRequestId.toString())
      expect(targetEvent.payload.rejectedBy).toEqual(fakeUser.id)
      expect(targetEvent.payload.responseFileId).toEqual(fakeResponseFileId)
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

      const res = fakeModificationRequest.reject(fakeUser, fakeResponseFileId)
      expect(res.isOk()).toBe(true)
    })

    it('should emit ModificationRequestRejected', () => {
      expect(fakeModificationRequest.pendingEvents).not.toHaveLength(0)

      const targetEvent = fakeModificationRequest.pendingEvents.find(
        (item) => item.type === ModificationRequestRejected.type
      ) as ModificationRequestRejected | undefined
      expect(targetEvent).toBeDefined()
      if (!targetEvent) return

      expect(targetEvent.payload.modificationRequestId).toEqual(modificationRequestId.toString())
      expect(targetEvent.payload.rejectedBy).toEqual(fakeUser.id)
      expect(targetEvent.payload.responseFileId).toEqual(fakeResponseFileId)
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

    it('should return StatusPreventsRejectingError', () => {
      expect(fakeModificationRequest.status).toEqual('acceptée')

      const res = fakeModificationRequest.reject(fakeUser, fakeResponseFileId)
      expect(res.isErr()).toBe(true)
      if (res.isOk()) return

      expect(res.error).toBeInstanceOf(StatusPreventsRejectingError)
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
              responseFileId: fakeResponseFileId,
            },
          }),
        ],
      })
    )

    it('should return StatusPreventsRejectingError', () => {
      expect(fakeModificationRequest.status).toEqual('rejetée')

      const res = fakeModificationRequest.reject(fakeUser, fakeResponseFileId)
      expect(res.isErr()).toBe(true)
      if (res.isOk()) return

      expect(res.error).toBeInstanceOf(StatusPreventsRejectingError)
    })
  })
})
