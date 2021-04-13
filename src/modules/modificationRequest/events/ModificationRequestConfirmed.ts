import { BaseDomainEvent, DomainEvent } from '../../../core/domain/DomainEvent'

export interface ModificationRequestConfirmedPayload {
  modificationRequestId: string
  confirmedBy: string
}
export class ModificationRequestConfirmed
  extends BaseDomainEvent<ModificationRequestConfirmedPayload>
  implements DomainEvent {
  public static type: 'ModificationRequestConfirmed' = 'ModificationRequestConfirmed'
  public type = ModificationRequestConfirmed.type
  currentVersion = 1

  aggregateIdFromPayload(payload: ModificationRequestConfirmedPayload) {
    return payload.modificationRequestId
  }
}
