import { BaseDomainEvent, DomainEvent } from '../../../core/domain/DomainEvent'

export interface InvitationRelanceSentPayload {
  email: string
  relanceBy: string
}
export class InvitationRelanceSent
  extends BaseDomainEvent<InvitationRelanceSentPayload>
  implements DomainEvent {
  public static type: 'InvitationRelanceSent' = 'InvitationRelanceSent'
  public type = InvitationRelanceSent.type
  currentVersion = 1

  aggregateIdFromPayload(payload: InvitationRelanceSentPayload) {
    return undefined
  }
}
