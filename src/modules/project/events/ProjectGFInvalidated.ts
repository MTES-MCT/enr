import { BaseDomainEvent, DomainEvent } from '../../../core/domain/DomainEvent'

export interface ProjectGFInvalidatedPayload {
  projectId: string
}
export class ProjectGFInvalidated
  extends BaseDomainEvent<ProjectGFInvalidatedPayload>
  implements DomainEvent {
  public static type: 'ProjectGFInvalidated' = 'ProjectGFInvalidated'
  public type = ProjectGFInvalidated.type
  currentVersion = 1

  aggregateIdFromPayload(payload: ProjectGFInvalidatedPayload) {
    return payload.projectId
  }
}
