import { logger } from '../../../../../core/utils'
import { AppelOffreRemoved } from '../../../../../modules/appelOffre'

export const onAppelOffreRemoved = (models) => async (event: AppelOffreRemoved) => {
  const { AppelOffre, Periode } = models
  const { appelOffreId } = event.payload
  const instance = await AppelOffre.findByPk(appelOffreId)

  if (!instance) {
    logger.error(
      `Error: onAppelOffreRemoved projection failed to retrieve project from db ${event}`
    )
    return
  }

  try {
    await instance.destroy()
    await Periode.destroy({ where: { appelOffreId } })
  } catch (e) {
    logger.error(e)
    logger.info('Error: onAppelOffreRemoved projection failed to update appel offre :', event)
  }
}
