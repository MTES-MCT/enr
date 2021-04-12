import models from '../../../models'
import { resetDatabase } from '../../../helpers'
import { onConfirmationRequested } from './onConfirmationRequested'
import { ConfirmationRequested } from '../../../../../modules/modificationRequest/events'
import { UniqueEntityID } from '../../../../../core/domain'

describe('modificationRequest.onConfirmationRequested', () => {
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
      type: 'recours',
      status: 'envoyée',
      requestedOn: 1,
      requestedBy: userId,
    })
  })

  it('should update status to en attente de confirmation and add response file', async () => {
    await onConfirmationRequested(models)(
      new ConfirmationRequested({
        payload: {
          modificationRequestId,
          confirmationRequestedBy: userId,
          responseFileId: fileId,
        },
      })
    )

    const updatedModificationRequest = await ModificationRequest.findByPk(modificationRequestId)
    expect(updatedModificationRequest.status).toEqual('en attente de confirmation')
    expect(updatedModificationRequest.responseFileId).toEqual(fileId)
  })
})
