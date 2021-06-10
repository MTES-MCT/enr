import { BaseDomainEvent, DomainEvent } from '../../../core/domain/DomainEvent'

//
// This event is a value dump for items that were in the projects database table before the switch to event sourcing
//

export interface UserRegisteredPayload {
  userId: string
  fullName: string
}
export class UserRegistered extends BaseDomainEvent<UserRegisteredPayload> implements DomainEvent {
  public static type: 'UserRegistered' = 'UserRegistered'
  public type = UserRegistered.type
  currentVersion = 1

  aggregateIdFromPayload(payload: UserRegisteredPayload) {
    return payload.userId
  }
}
