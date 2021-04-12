import { BaseDomainEvent, DomainEvent } from '../../../core/domain/DomainEvent'

export interface ConfirmationRequestedPayload {
  modificationRequestId: string
  responseFileId: string
  confirmationRequestedBy: string
}
export class ConfirmationRequested
  extends BaseDomainEvent<ConfirmationRequestedPayload>
  implements DomainEvent {
  public static type: 'ConfirmationRequested' = 'ConfirmationRequested'
  public type = ConfirmationRequested.type
  currentVersion = 1

  aggregateIdFromPayload(payload: ConfirmationRequestedPayload) {
    return payload.modificationRequestId
  }
}
