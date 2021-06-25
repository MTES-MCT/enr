import { logger } from '../../../../../core/utils'
import { UserProjectsLinkedByContactEmail } from '../../../../../modules/authorization'

export const onUserProjectsLinkedByContactEmail = (models) => async (
  event: UserProjectsLinkedByContactEmail
) => {
  const { UserProjects } = models
  const { userId, projectIds } = event.payload

  try {
    await UserProjects.bulkCreate(projectIds.map((projectId) => ({ userId, projectId })))
  } catch (e) {
    logger.error(e)
  }
}
