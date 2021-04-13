import { DomainEvent, BaseDomainEvent } from '../../../core/domain/DomainEvent'

export interface ProjectAbandonedPayload {
  projectId: string
  abandonAcceptedBy: string
}
export class ProjectAbandoned
  extends BaseDomainEvent<ProjectAbandonedPayload>
  implements DomainEvent {
  public static type: 'ProjectAbandoned' = 'ProjectAbandoned'
  public type = ProjectAbandoned.type
  currentVersion = 1

  aggregateIdFromPayload(payload: ProjectAbandonedPayload) {
    return payload.projectId
  }
}
