import { UniqueEntityID } from '../../../core/domain'
import { resetDatabase } from '../helpers'
import makeFakeProject from '../../../__tests__/fixtures/project'
import makeFakeUser from '../../../__tests__/fixtures/user'
import models from '../models'
import { makeGetModificationRequestInfoForConfirmedNotification } from './getModificationRequestInfoForConfirmedNotification'

describe('Sequelize getModificationRequestInfoForConfirmedNotification', () => {
  const getModificationRequestInfoForConfirmedNotification = makeGetModificationRequestInfoForConfirmedNotification(
    models
  )

  const { Project, ModificationRequest, User } = models

  const projectId = new UniqueEntityID().toString()
  const modificationRequestId = new UniqueEntityID().toString()
  const userId = new UniqueEntityID().toString()
  const adminId = new UniqueEntityID().toString()

  const projectInfo = {
    id: projectId,
    nomProjet: 'nomProjet',
  }

  beforeAll(async () => {
    // Create the tables and remove all data
    await resetDatabase()

    await Project.create(makeFakeProject(projectInfo))

    await User.create(makeFakeUser({ id: adminId, fullName: 'admin1', email: 'admin1@test.test' }))
    await User.create(makeFakeUser({ id: userId }))

    await ModificationRequest.create({
      id: modificationRequestId,
      projectId,
      userId,
      type: 'abandon',
      requestedOn: 123,
      requestedBy: userId,
      status: 'demande confirmée',
      confirmationRequestedBy: adminId,
    })
  })

  it('should return a complete ModificationRequestInfoForConfirmedNotificationDTO', async () => {
    const modificationRequestResult = await getModificationRequestInfoForConfirmedNotification(
      modificationRequestId.toString()
    )

    expect(modificationRequestResult.isOk()).toBe(true)
    if (modificationRequestResult.isErr()) return

    const modificationRequestDTO = modificationRequestResult.value

    expect(modificationRequestDTO).toEqual({
      nomProjet: 'nomProjet',
      type: 'abandon',
      chargeAffaire: {
        id: adminId,
        fullName: 'admin1',
        email: 'admin1@test.test',
      },
    })
  })
})
