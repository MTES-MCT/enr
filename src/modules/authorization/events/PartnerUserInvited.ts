import { BaseDomainEvent, DomainEvent } from '../../../core/domain/DomainEvent'

export interface PartnerUserInvitedPayload {
  userId: string
  role: string
  invitedBy: string
}
export class PartnerUserInvited
  extends BaseDomainEvent<PartnerUserInvitedPayload>
  implements DomainEvent {
  public static type: 'PartnerUserInvited' = 'PartnerUserInvited'
  public type = PartnerUserInvited.type
  currentVersion = 1

  aggregateIdFromPayload(payload: PartnerUserInvitedPayload) {
    return undefined
  }
}
