import { Op } from 'sequelize'
import { logger } from '../../../../../core/utils'
import {
  ProjectDCRRemoved,
  ProjectGFRemoved,
  ProjectPTFRemoved,
} from '../../../../../modules/project/events'

type StepRemovedEvent = ProjectPTFRemoved | ProjectDCRRemoved | ProjectGFRemoved

const StepTypeByEventType: Record<StepRemovedEvent['type'], string> = {
  [ProjectPTFRemoved.type]: 'ptf',
  [ProjectDCRRemoved.type]: 'dcr',
  [ProjectGFRemoved.type]: 'garantie-financiere',
}

export const onProjectStepRemoved = (models) => async (event: StepRemovedEvent) => {
  const { ProjectStep } = models

  const { projectId } = event.payload
  try {
    await ProjectStep.destroy({
      where: {
        type: StepTypeByEventType[event.type],
        projectId,
        [Op.or]: [{ status: null }, { status: 'à traiter' }],
      },
    })
  } catch (e) {
    logger.error(e)
  }
}
