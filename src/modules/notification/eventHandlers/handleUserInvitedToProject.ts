import { NotificationService } from '..'
import moment from 'moment'
import { ProjectRepo, UserRepo } from '../../../dataAccess'
import routes from '../../../routes'
import { UserInvitedToProject } from '../../authorization'
import { logger } from '../../../core/utils'

export const handleUserInvitedToProject = (deps: {
  sendNotification: NotificationService['sendNotification']
  findUserById: UserRepo['findById']
  findProjectById: ProjectRepo['findById']
}) => async (event: UserInvitedToProject) => {
  const { userId, projectIds } = event.payload

  const projects = await Promise.all(projectIds.map((projectId) => deps.findProjectById(projectId)))

  const nomProjet = projects.map((project) => project && project.nomProjet).join(', ')

  if (!nomProjet || !nomProjet.length) {
    logger.error(new Error('Could not find targetted projects.'))
    return
  }

  // Send user email
  ;(await deps.findUserById(userId)).match({
    some: async ({ email, fullName }) => {
      await deps.sendNotification({
        type: 'project-invitation',
        message: {
          email,
          name: fullName,
          subject: 'Invitation à suivre les projets sur Potentiel',
        },
        context: {
          userId,
          projectIds,
        },
        variables: {
          nomProjet,
          invitation_link: routes.USER_LIST_PROJECTS,
        },
      })
    },
    none: () => {},
  })
}
