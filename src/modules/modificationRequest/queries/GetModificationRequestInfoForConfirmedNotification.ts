import { ResultAsync } from '../../../core/utils'
import { EntityNotFoundError, InfraNotAvailableError } from '../../shared'
import { ModificationRequestInfoForConfirmedNotificationDTO } from '../dtos'

export interface GetModificationRequestInfoForConfirmedNotification {
  (modificationRequestId: string): ResultAsync<
    ModificationRequestInfoForConfirmedNotificationDTO,
    EntityNotFoundError | InfraNotAvailableError
  >
}
