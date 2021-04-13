import { EventBus } from '../../../../../modules/eventStore'
import {
  ModificationRequested,
  ModificationRequestAccepted,
  ModificationRequestInstructionStarted,
  ModificationRequestRejected,
  ModificationRequestStatusUpdated,
  ConfirmationRequested,
  ModificationRequestConfirmed,
} from '../../../../../modules/modificationRequest'
import { onModificationRequested } from './onModificationRequested'
import { onModificationRequestAccepted } from './onModificationRequestAccepted'
import { onModificationRequestRejected } from './onModificationRequestRejected'
import { onModificationRequestStatusUpdated } from './onModificationRequestStatusUpdated'
import { onConfirmationRequested } from './onConfirmationRequested'
import { onModificationRequestConfirmed } from './onModificationRequestConfirmed'
import { onModificationRequestInstructionStarted } from './onModificationRequestInstructionStarted'
import { logger } from '../../../../../core/utils'

export const initModificationRequestProjections = (eventBus: EventBus, models) => {
  eventBus.subscribe(ModificationRequested.type, onModificationRequested(models))
  eventBus.subscribe(ConfirmationRequested.type, onConfirmationRequested(models))
  eventBus.subscribe(ModificationRequestConfirmed.type, onModificationRequestConfirmed(models))
  eventBus.subscribe(ModificationRequestAccepted.type, onModificationRequestAccepted(models))
  eventBus.subscribe(ModificationRequestRejected.type, onModificationRequestRejected(models))
  eventBus.subscribe(
    ModificationRequestInstructionStarted.type,
    onModificationRequestInstructionStarted(models)
  )
  eventBus.subscribe(
    ModificationRequestStatusUpdated.type,
    onModificationRequestStatusUpdated(models)
  )

  logger.info('Initialized ModificationRequest projections')
}
