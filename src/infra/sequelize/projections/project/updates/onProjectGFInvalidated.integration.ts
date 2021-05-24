import models from '../../../models'
import { resetDatabase } from '../../../helpers'
import { onProjectGFInvalidated } from './onProjectGFInvalidated'
import { ProjectGFInvalidated } from '../../../../../modules/project/events'
import { v4 as uuid } from 'uuid'
import makeFakeProjectStep from '../../../../../__tests__/fixtures/projectStep'

describe('project.onProjectGFInvalidated', () => {
  const { ProjectStep } = models
  const projectId = uuid()
  const projectStepId1 = uuid()
  const projectStepId2 = uuid()
  const projectStep2 = makeFakeProjectStep({
    id: projectStepId2,
    projectId,
    status: 'invalidé',
    updatedAt: new Date('01/01/2021'),
  })

  describe('when current GF status is "null"', () => {
    const projectStep1 = makeFakeProjectStep({ id: projectStepId1, projectId, status: null })

    beforeAll(async () => {
      await resetDatabase()
      await ProjectStep.bulkCreate([projectStep1, projectStep2])
    })

    it('should set the GF status to "invalidé" without modifying the one already with this status', async () => {
      await onProjectGFInvalidated(models)(
        new ProjectGFInvalidated({
          payload: { projectId },
        })
      )

      const projectSteps = await ProjectStep.findAll({
        where: { projectId, type: 'garantie-financiere' },
        order: ['updatedAt'],
      })

      expect(projectSteps[0].updatedAt).toEqual(projectStep2.updatedAt)
      expect(projectSteps[1].status).toEqual('invalidé')
    })
  })

  describe('when current GF status is "à traiter"', () => {
    const projectStep1 = makeFakeProjectStep({ id: projectStepId1, projectId, status: 'à traiter' })

    beforeAll(async () => {
      await resetDatabase()
      await ProjectStep.bulkCreate([projectStep1, projectStep2])
    })

    it('should set the GF status to "invalidé" without modifying the one already with this status', async () => {
      await onProjectGFInvalidated(models)(
        new ProjectGFInvalidated({
          payload: { projectId },
        })
      )

      const projectSteps = await ProjectStep.findAll({
        where: { projectId, type: 'garantie-financiere' },
        order: ['updatedAt'],
      })

      expect(projectSteps[0].updatedAt).toEqual(projectStep2.updatedAt)
      expect(projectSteps[1].status).toEqual('invalidé')
    })
  })

  describe('when current GF status is "validé"', () => {
    const projectStep1 = makeFakeProjectStep({ id: projectStepId1, projectId, status: 'validé' })

    beforeAll(async () => {
      await resetDatabase()
      await ProjectStep.bulkCreate([projectStep1, projectStep2])
    })

    it('should set the GF status to "invalidé" without modifying the one already with this status', async () => {
      await onProjectGFInvalidated(models)(
        new ProjectGFInvalidated({
          payload: { projectId },
        })
      )

      const projectSteps = await ProjectStep.findAll({
        where: { projectId, type: 'garantie-financiere' },
        order: ['updatedAt'],
      })

      expect(projectSteps[0].updatedAt).toEqual(projectStep2.updatedAt)
      expect(projectSteps[1].status).toEqual('invalidé')
    })
  })
})
