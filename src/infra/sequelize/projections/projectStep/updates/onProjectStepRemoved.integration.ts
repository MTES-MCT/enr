import { UniqueEntityID } from '../../../../../core/domain'
import {
  ProjectDCRRemoved,
  ProjectGFRemoved,
  ProjectPTFRemoved,
} from '../../../../../modules/project/events'
import { resetDatabase } from '../../../helpers'
import models from '../../../models'
import { onProjectStepRemoved } from './onProjectStepRemoved'

describe('projectStep.onProjectStepRemoved', () => {
  const { ProjectStep } = models

  const projectId = new UniqueEntityID().toString()

  describe('when event is ProjectPTFRemoved', () => {
    beforeAll(async () => {
      // Create the tables and remove all data
      await resetDatabase()

      await ProjectStep.create({
        id: new UniqueEntityID().toString(),
        projectId,
        type: 'ptf',
        stepDate: new Date(123),
        fileId: new UniqueEntityID().toString(),
        submittedBy: new UniqueEntityID().toString(),
        submittedOn: new Date(1234),
      })

      expect(await ProjectStep.count({ where: { projectId, type: 'ptf' } })).toEqual(1)
    })

    it('should remove the project ptf step', async () => {
      const event = new ProjectPTFRemoved({
        payload: {
          projectId,
          removedBy: new UniqueEntityID().toString(),
        },
      })
      await onProjectStepRemoved(models)(event)

      expect(await ProjectStep.count({ where: { projectId, type: 'ptf' } })).toEqual(0)
    })
  })

  describe('when event is ProjectDCRRemoved', () => {
    beforeAll(async () => {
      // Create the tables and remove all data
      await resetDatabase()

      await ProjectStep.create({
        id: new UniqueEntityID().toString(),
        projectId,
        type: 'dcr',
        stepDate: new Date(123),
        fileId: new UniqueEntityID().toString(),
        submittedBy: new UniqueEntityID().toString(),
        submittedOn: new Date(1234),
      })

      expect(await ProjectStep.count({ where: { projectId, type: 'dcr' } })).toEqual(1)
    })

    it('should remove the project dcr step', async () => {
      const event = new ProjectDCRRemoved({
        payload: {
          projectId,
          removedBy: new UniqueEntityID().toString(),
        },
      })
      await onProjectStepRemoved(models)(event)

      expect(await ProjectStep.count({ where: { projectId, type: 'dcr' } })).toEqual(0)
    })
  })

  describe('when event is ProjectGFRemoved', () => {
    beforeAll(async () => {
      // Create the tables and remove all data
      await resetDatabase()

      await ProjectStep.create({
        id: new UniqueEntityID().toString(),
        projectId,
        type: 'garantie-financiere',
        stepDate: new Date(123),
        fileId: new UniqueEntityID().toString(),
        submittedBy: new UniqueEntityID().toString(),
        submittedOn: new Date(1234),
      })

      expect(
        await ProjectStep.count({ where: { projectId, type: 'garantie-financiere' } })
      ).toEqual(1)
    })

    it('should remove the project garantie-financiere step', async () => {
      const event = new ProjectGFRemoved({
        payload: {
          projectId,
          removedBy: new UniqueEntityID().toString(),
        },
      })
      await onProjectStepRemoved(models)(event)

      expect(
        await ProjectStep.count({ where: { projectId, type: 'garantie-financiere' } })
      ).toEqual(0)
    })
  })
})
