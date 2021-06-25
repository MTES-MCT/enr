import { EventBus } from '../../../../../modules/eventStore'

import { onUserRightsToProjectRevoked } from './onUserRightsToProjectRevoked'
import { onUserInvitedToProject } from './onUserInvitedToProject'
import { onUserProjectsLinkedByContactEmail } from './onUserProjectsLinkedByContactEmail'
import { logger } from '../../../../../core/utils'
import {
  UserInvitedToProject,
  UserProjectsLinkedByContactEmail,
  UserRightsToProjectRevoked,
} from '../../../../../modules/authorization'

export const initUserProjectsProjections = (eventBus: EventBus, models) => {
  eventBus.subscribe(UserRightsToProjectRevoked.type, onUserRightsToProjectRevoked(models))
  eventBus.subscribe(UserInvitedToProject.type, onUserInvitedToProject(models))
  eventBus.subscribe(
    UserProjectsLinkedByContactEmail.type,
    onUserProjectsLinkedByContactEmail(models)
  )

  logger.info('Initialized User Projects projections')
}
export * from './onUserInvitedToProject'
