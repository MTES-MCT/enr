import { logger } from '../../../../../core/utils'
import { UserInvitedToProject } from '../../../../../modules/authorization'

export const onUserInvitedToProject = (models) => async (event: UserInvitedToProject) => {
  const { UserProjects } = models
  const { userId, projectIds } = event.payload

  try {
    await UserProjects.bulkCreate(projectIds.map((projectId) => ({ userId, projectId })))
  } catch (e) {
    logger.error(e)
  }
}
