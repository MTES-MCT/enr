import { BaseDomainEvent, DomainEvent } from '../../../core/domain/DomainEvent'

//
// This event is a value dump for items that were in the projects database table before the switch to event sourcing
//

export interface UserCreatedPayload {
  userId: string
  email: string
  role: string
  fullName?: string
}
export class UserCreated extends BaseDomainEvent<UserCreatedPayload> implements DomainEvent {
  public static type: 'UserCreated' = 'UserCreated'
  public type = UserCreated.type
  currentVersion = 1

  aggregateIdFromPayload(payload: UserCreatedPayload) {
    return undefined
  }
}
