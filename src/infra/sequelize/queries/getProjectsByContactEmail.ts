import { errAsync, ResultAsync } from '../../../core/utils'
import { GetProjectsByContactEmail } from '../../../modules/project'
import { InfraNotAvailableError } from '../../../modules/shared'

export const makeGetProjectsByContactEmail = (models): GetProjectsByContactEmail => (email) => {
  const { Project } = models
  if (!Project) return errAsync(new InfraNotAvailableError())

  return ResultAsync.fromPromise(
    Project.findAll({
      where: { email },
      attributes: ['id'],
    }),
    () => new InfraNotAvailableError()
  ).map((projects: any) => projects.map((project) => project.id))
}
