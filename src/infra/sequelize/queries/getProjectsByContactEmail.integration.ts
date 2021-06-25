import models from '../models'
import { resetDatabase } from '../helpers'
import makeFakeProject from '../../../__tests__/fixtures/project'

import { makeGetProjectsByContactEmail } from './getProjectsByContactEmail'
import { UniqueEntityID } from '../../../core/domain'

describe('Sequelize getProjectsByContactEmail', () => {
  const projectId = new UniqueEntityID().toString()
  const email = 'test@test.test'
  const getProjectsByContactEmail = makeGetProjectsByContactEmail(models)

  const { Project } = models

  describe('given an email', () => {
    beforeAll(async () => {
      await resetDatabase()
      await Project.bulkCreate([
        makeFakeProject({
          id: projectId,
          email,
        }),
        makeFakeProject({
          email: 'other@test.test',
        }),
      ])
    })

    it('should return a list of ids for projects with that email as contact email', async () => {
      const res = await getProjectsByContactEmail(email)

      expect(res._unsafeUnwrap()).toEqual([projectId])
    })
  })
})
