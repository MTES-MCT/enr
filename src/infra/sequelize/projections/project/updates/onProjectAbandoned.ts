import { logger } from '../../../../../core/utils'
import { ProjectAbandoned } from '../../../../../modules/project/events'

export const onProjectAbandoned = (models) => async (event: ProjectAbandoned) => {
  const { Project } = models
  const projectInstance = await Project.findByPk(event.payload.projectId)

  if (!projectInstance) {
    logger.error(
      `Error: onProjectAbandoned projection failed to retrieve project from db': ${event}`
    )
    return
  }

  projectInstance.abandonedOn = event.occurredAt.getTime()
  projectInstance.garantiesFinancieresDueOn = 0
  projectInstance.dcrDueOn = 0
  projectInstance.completionDueOn = 0

  try {
    await projectInstance.save()
  } catch (e) {
    logger.error(e)
    logger.info('Error: onProjectAbandoned projection failed to update project', event)
  }
}
