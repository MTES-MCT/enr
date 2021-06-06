import { err, ok, wrapInfra } from '../../../core/utils'
import { GetProjectStepStatus } from '../../../modules/project'
import { EntityNotFoundError } from '../../../modules/shared'

export const makeGetProjectStepStatus = (models): GetProjectStepStatus => (
  projectStepId: string
) => {
  const { ProjectStep } = models

  return wrapInfra(ProjectStep.findByPk(projectStepId)).andThen((projectStep: any) => {
    if (!projectStep) return err(new EntityNotFoundError())
    return ok(projectStep.status)
  })
}
