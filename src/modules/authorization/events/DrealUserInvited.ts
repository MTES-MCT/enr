import { BaseDomainEvent, DomainEvent } from '../../../core/domain/DomainEvent'

export interface DrealUserInvitedPayload {
  userId: string
  region: string
  invitedBy: string
}
export class DrealUserInvited
  extends BaseDomainEvent<DrealUserInvitedPayload>
  implements DomainEvent {
  public static type: 'DrealUserInvited' = 'DrealUserInvited'
  public type = DrealUserInvited.type
  currentVersion = 1

  aggregateIdFromPayload(payload: DrealUserInvitedPayload) {
    return undefined
  }
}
