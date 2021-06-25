import { BaseDomainEvent, DomainEvent } from '../../../core/domain/DomainEvent'

//
// This event is a value dump for items that were in the projects database table before the switch to event sourcing
//

export interface UserInvitedToProjectPayload {
  userId: string
  projectIds: string[]
  invitedBy: string
}
export class UserInvitedToProject
  extends BaseDomainEvent<UserInvitedToProjectPayload>
  implements DomainEvent {
  public static type: 'UserInvitedToProject' = 'UserInvitedToProject'
  public type = UserInvitedToProject.type
  currentVersion = 1

  aggregateIdFromPayload(payload: UserInvitedToProjectPayload) {
    return undefined
  }
}
