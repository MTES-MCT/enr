import { logger } from '../../../../../core/utils'
import { ModificationRequestConfirmed } from '../../../../../modules/modificationRequest/events'

export const onModificationRequestConfirmed = (models) => async (
  event: ModificationRequestConfirmed
) => {
  const { ModificationRequest } = models
  const instance = await ModificationRequest.findByPk(event.payload.modificationRequestId)

  if (!instance) {
    logger.error(
      `Error: onModificationRequestConfirmed projection failed to retrieve modification request from db ${event}`
    )

    return
  }

  instance.status = 'demande confirmée'
  instance.versionDate = event.occurredAt

  try {
    await instance.save()
  } catch (e) {
    logger.error(e)
    logger.info(
      'Error: onModificationRequestConfirmed projection failed to update modification request :',
      event
    )
  }
}
