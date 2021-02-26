import { errAsync, logger, okAsync, ResultAsync } from '../../../core/utils'
import { User } from '../../../entities'
import { EventBus } from '../../eventStore'
import { InfraNotAvailableError, UnauthorizedError } from '../../shared'
import { ProjectPTFRemoved } from '../events'

interface RemoveStepDeps {
  shouldUserAccessProject: (args: { user: User; projectId: string }) => Promise<boolean>
  eventBus: EventBus
}

type RemoveStepArgs = {
  type: 'ptf'
  projectId: string
  removedBy: User
}

export const makeRemoveStep = (deps: RemoveStepDeps) => ({
  type,
  projectId,
  removedBy,
}: RemoveStepArgs): ResultAsync<null, InfraNotAvailableError | UnauthorizedError> => {
  return ResultAsync.fromPromise(
    deps.shouldUserAccessProject({ projectId, user: removedBy }),
    (e: Error) => {
      logger.error(e)
      return new InfraNotAvailableError()
    }
  ).andThen(
    (userHasRightsToProject): ResultAsync<null, InfraNotAvailableError | UnauthorizedError> => {
      if (!userHasRightsToProject) return errAsync(new UnauthorizedError())

      return type === 'ptf'
        ? deps.eventBus.publish(
            new ProjectPTFRemoved({
              payload: {
                projectId,
                removedBy: removedBy.id,
              },
            })
          )
        : okAsync(null)
    }
  )
}