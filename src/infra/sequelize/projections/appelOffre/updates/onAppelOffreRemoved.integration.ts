import models from '../../../models'
import { resetDatabase } from '../../../helpers'
import { onAppelOffreRemoved } from './onAppelOffreRemoved'
import { AppelOffreRemoved } from '../../../../../modules/appelOffre/events'
import { UniqueEntityID } from '../../../../../core/domain'

describe('appelOffre.onAppelOffreRemoved', () => {
  const { AppelOffre, Periode } = models

  const appelOffreId = new UniqueEntityID().toString()
  const periodeId = new UniqueEntityID().toString()

  beforeAll(async () => {
    // Create the tables and remove all data
    await resetDatabase()

    await AppelOffre.create({
      id: appelOffreId,
      data: { param2: 'value2', param3: 'value3' },
    })

    await Periode.create({
      appelOffreId,
      periodeId,
      data: {},
    })

    await onAppelOffreRemoved(models)(
      new AppelOffreRemoved({
        payload: {
          appelOffreId,
          removedBy: '',
        },
      })
    )
  })

  it('should remove the appel offre', async () => {
    const appelOffre = await AppelOffre.findByPk(appelOffreId)
    expect(appelOffre).toBeNull()
  })

  it('should remove the periodes of the appel offre', async () => {
    const periode = await Periode.findOne({ where: { appelOffreId, periodeId } })
    expect(periode).toBeNull()
  })
})
