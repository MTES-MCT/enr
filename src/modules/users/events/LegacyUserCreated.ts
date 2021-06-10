import { BaseDomainEvent, DomainEvent } from '../../../core/domain/DomainEvent'

//
// This event is a value dump for items that were in the projects database table before the switch to event sourcing
//

export interface LegacyUserCreatedPayload {
  userId: string
  keycloakId: string
  email: string
  role: string
  fullName: string
  projectAdmissionKey?: string
}
export class LegacyUserCreated
  extends BaseDomainEvent<LegacyUserCreatedPayload>
  implements DomainEvent {
  public static type: 'LegacyUserCreated' = 'LegacyUserCreated'
  public type = LegacyUserCreated.type
  currentVersion = 1

  aggregateIdFromPayload(payload: LegacyUserCreatedPayload) {
    return payload.userId
  }
}
