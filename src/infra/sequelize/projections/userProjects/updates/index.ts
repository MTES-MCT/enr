import { EventBus } from '../../../../../modules/eventStore'

import { onUserRightsToProjectRevoked } from './onUserRightsToProjectRevoked'
import { logger } from '../../../../../core/utils'
import { UserRightsToProjectRevoked } from '../../../../../modules/authorization'

export const initUserProjectsProjections = (eventBus: EventBus, models) => {
  eventBus.subscribe(UserRightsToProjectRevoked.type, onUserRightsToProjectRevoked(models))

  logger.info('Initialized User Projects projections')
}
export * from './onUserInvitedToProject'
