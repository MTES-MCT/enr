import { logger } from '../../../../../core/utils'
import { ConfirmationRequested } from '../../../../../modules/modificationRequest/events'

export const onConfirmationRequested = (models) => async (event: ConfirmationRequested) => {
  const { ModificationRequest } = models
  const instance = await ModificationRequest.findByPk(event.payload.modificationRequestId)

  if (!instance) {
    logger.error(
      `Error: onConfirmationRequested projection failed to retrieve modification request from db ${event}`
    )

    return
  }

  instance.status = 'en attente de confirmation'
  instance.responseFileId = event.payload.responseFileId

  try {
    await instance.save()
  } catch (e) {
    logger.error(e)
    logger.info(
      'Error: onConfirmationRequested projection failed to update modification request :',
      event
    )
  }
}