import { BaseDomainEvent, DomainEvent } from '../../../core/domain/DomainEvent'

export interface UserProjectsLinkedByContactEmailPayload {
  userId: string
  projectIds: string[]
}
export class UserProjectsLinkedByContactEmail
  extends BaseDomainEvent<UserProjectsLinkedByContactEmailPayload>
  implements DomainEvent {
  public static type: 'UserProjectsLinkedByContactEmail' = 'UserProjectsLinkedByContactEmail'
  public type = UserProjectsLinkedByContactEmail.type
  currentVersion = 1

  aggregateIdFromPayload(payload: UserProjectsLinkedByContactEmailPayload) {
    return undefined
  }
}
