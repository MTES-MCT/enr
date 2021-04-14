import models from '../../../models'
import { resetDatabase } from '../../../helpers'
import { onModificationRequestConfirmed } from './onModificationRequestConfirmed'
import { ModificationRequestConfirmed } from '../../../../../modules/modificationRequest/events'
import { UniqueEntityID } from '../../../../../core/domain'

describe('modificationRequest.onModificationRequestConfirmed', () => {
  const { ModificationRequest } = models

  const modificationRequestId = new UniqueEntityID().toString()
  const projectId = new UniqueEntityID().toString()
  const userId = new UniqueEntityID().toString()
  const fileId = new UniqueEntityID().toString()

  beforeAll(async () => {
    // Create the tables and remove all data
    await resetDatabase()

    await ModificationRequest.create({
      id: modificationRequestId,
      projectId,
      userId,
      type: 'abandon',
      status: 'en attente de confirmation',
      requestedOn: 1,
      requestedBy: userId,
    })

    await onModificationRequestConfirmed(models)(
      new ModificationRequestConfirmed({
        payload: {
          modificationRequestId,
          confirmedBy: userId,
        },
        original: {
          version: 1,
          occurredAt: new Date(123),
        },
      })
    )
  })

  it('should update status to demande confirmée', async () => {
    const updatedModificationRequest = await ModificationRequest.findByPk(modificationRequestId)
    expect(updatedModificationRequest.status).toEqual('demande confirmée')
  })

  it('should set confirmedBy and confirmedOn', async () => {
    const updatedModificationRequest = await ModificationRequest.findByPk(modificationRequestId)
    expect(updatedModificationRequest.confirmedBy).toEqual(userId)
    expect(updatedModificationRequest.confirmedOn).toEqual(123)
  })
})
