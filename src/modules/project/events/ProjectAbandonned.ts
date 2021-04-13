import { DomainEvent, BaseDomainEvent } from '../../../core/domain/DomainEvent'

export interface ProjectAbandonnedPayload {
  projectId: string
  abandonAcceptedBy: string
}
export class ProjectAbandonned
  extends BaseDomainEvent<ProjectAbandonnedPayload>
  implements DomainEvent {
  public static type: 'ProjectAbandonned' = 'ProjectAbandonned'
  public type = ProjectAbandonned.type
  currentVersion = 1

  aggregateIdFromPayload(payload: ProjectAbandonnedPayload) {
    return payload.projectId
  }
}
