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
  })

  it('should update status to demande confirmée', async () => {
    await onModificationRequestConfirmed(models)(
      new ModificationRequestConfirmed({
        payload: {
          modificationRequestId,
          confirmedBy: userId,
        },
      })
    )

    const updatedModificationRequest = await ModificationRequest.findByPk(modificationRequestId)
    expect(updatedModificationRequest.status).toEqual('demande confirmée')
  })
})
