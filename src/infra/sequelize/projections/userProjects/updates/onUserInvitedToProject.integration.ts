import { UniqueEntityID } from '../../../../../core/domain'
import {
  UserInvitedToProject,
  UserRightsToProjectRevoked,
} from '../../../../../modules/authorization'
import { resetDatabase } from '../../../helpers'
import models from '../../../models'
import { onUserInvitedToProject } from './onUserInvitedToProject'

describe('userProjects.onUserInvitedToProject', () => {
  const { UserProjects } = models

  const projectId1 = new UniqueEntityID().toString()
  const projectId2 = new UniqueEntityID().toString()
  const userId = new UniqueEntityID().toString()

  beforeAll(async () => {
    // Create the tables and remove all data
    await resetDatabase()
  })

  it('should create rows for each projectId', async () => {
    expect(await UserProjects.count()).toEqual(0)

    const event = new UserInvitedToProject({
      payload: {
        projectIds: [projectId1, projectId2],
        userId,
        invitedBy: new UniqueEntityID().toString(),
      },
    })
    await onUserInvitedToProject(models)(event)

    expect(await UserProjects.count({ where: { userId, projectId: projectId1 } })).toEqual(1)
    expect(await UserProjects.count({ where: { userId, projectId: projectId2 } })).toEqual(1)
  })
})
