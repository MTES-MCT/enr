import { EventBus } from '../../../../../modules/eventStore'

import { onUserRightsToProjectRevoked } from './onUserRightsToProjectRevoked'
import { onUserInvitedToProject } from './onUserInvitedToProject'
import { logger } from '../../../../../core/utils'
import {
  UserInvitedToProject,
  UserRightsToProjectRevoked,
} from '../../../../../modules/authorization'

export const initUserProjectsProjections = (eventBus: EventBus, models) => {
  eventBus.subscribe(UserRightsToProjectRevoked.type, onUserRightsToProjectRevoked(models))
  eventBus.subscribe(UserInvitedToProject.type, onUserInvitedToProject(models))

  logger.info('Initialized User Projects projections')
}
export * from './onUserInvitedToProject'
