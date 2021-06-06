import { UniqueEntityID } from '../../../core/domain'
import { InfraNotAvailableError } from '../../../modules/shared'
import { resetDatabase } from '../helpers'
import models from '../models'
import { makeGetProjectStepStatus } from './getProjectStepStatus'

describe('Sequelize getProjectStepStatus', () => {
  const getProjectStepStatus = makeGetProjectStepStatus(models)
  const { ProjectStep } = models

  const projectStepId = new UniqueEntityID().toString()

  beforeAll(async () => {
    await resetDatabase()
    await ProjectStep.bulkCreate([
      {
        id: projectStepId,
        projectId: new UniqueEntityID().toString(),
        status: 'validé',
        type: 'garantie-financiere',
        stepDate: new Date(),
        fileId: new UniqueEntityID().toString(),
        submittedOn: new Date(),
        submittedBy: new UniqueEntityID().toString(),
      },
    ])
  })

  describe('when the user exists', () => {
    it('should the project status', async () => {
      const res = await getProjectStepStatus(projectStepId)
      expect(res._unsafeUnwrap()).toEqual('validé')
    })
  })

  describe('when the project step does not exist', () => {
    it('should return EntityNotFoundError', async () => {
      const res = await getProjectStepStatus('fakeId')
      expect(res._unsafeUnwrapErr()).toBeInstanceOf(InfraNotAvailableError)
    })
  })
})
