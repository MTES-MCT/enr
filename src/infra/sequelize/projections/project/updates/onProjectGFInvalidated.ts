import { Op } from 'sequelize'
import { logger } from '../../../../../core/utils'
import { ProjectGFInvalidated } from '../../../../../modules/project/events'

export const onProjectGFInvalidated = (models) => async (event: ProjectGFInvalidated) => {
  const { ProjectStep } = models
  const { projectId } = event.payload

  try {
    await ProjectStep.update(
      { status: 'invalidé' },
      {
        where: {
          projectId,
          type: 'garantie-financiere',
          [Op.or]: [{ status: ['à traiter', 'validé'] }, { status: null }],
        },
      }
    )
  } catch (e) {
    logger.error(e)
    logger.info('Error: onProjectGFInvalidated projection failed to update project step', event)
  }
}
