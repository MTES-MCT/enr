import { ValidatedGFCannotBeRemovedError } from '..'
import { DomainEvent, Repository, UniqueEntityID } from '../../../core/domain'
import { errAsync, logger, ResultAsync, wrapInfra } from '../../../core/utils'
import { User } from '../../../entities'
import { EventBus } from '../../eventStore'
import { InfraNotAvailableError, UnauthorizedError } from '../../shared'
import { ProjectDCRRemoved, ProjectGFRemoved, ProjectPTFRemoved } from '../events'
import { Project } from '../Project'

interface RemoveStepDeps {
  shouldUserAccessProject: (args: { user: User; projectId: string }) => Promise<boolean>
  getProjectStepStatus: (projectStepId: string) => ResultAsync<string, InfraNotAvailableError>
  projectRepo: Repository<Project>
  eventBus: EventBus
}

type RemoveStepArgs = {
  type: 'ptf' | 'dcr' | 'garantie-financiere'
  projectId: string
  projectStepId: string
  removedBy: User
}

export const makeRemoveStep = (deps: RemoveStepDeps) => (
  args: RemoveStepArgs
): ResultAsync<
  null,
  ValidatedGFCannotBeRemovedError | InfraNotAvailableError | UnauthorizedError
> => {
  const { projectId, projectStepId, removedBy, type } = args

  return wrapInfra(deps.shouldUserAccessProject({ projectId, user: removedBy }))
    .andThen(
      (userHasRightsToProject): ResultAsync<string, InfraNotAvailableError | UnauthorizedError> => {
        if (!userHasRightsToProject) return errAsync(new UnauthorizedError())

        return deps.getProjectStepStatus(projectStepId)
      }
    )
    .andThen(
      (
        status: string
      ): ResultAsync<
        null,
        ValidatedGFCannotBeRemovedError | InfraNotAvailableError | UnauthorizedError
      > => {
        if (type === 'garantie-financiere' && status === 'validé')
          return errAsync(new ValidatedGFCannotBeRemovedError())

        return deps.eventBus.publish(_makeEventForType(args))
      }
    )
}

const _makeEventForType = ({
  type,
  projectId,
  projectStepId,
  removedBy,
}: RemoveStepArgs): DomainEvent => {
  let payload: any = {
    projectId,
    removedBy: removedBy.id,
  }

  switch (type) {
    case 'dcr':
      return new ProjectDCRRemoved({ payload })
    case 'ptf':
      return new ProjectPTFRemoved({ payload })
    case 'garantie-financiere':
      payload.projectStepId = projectStepId
      return new ProjectGFRemoved({ payload })
  }
}
