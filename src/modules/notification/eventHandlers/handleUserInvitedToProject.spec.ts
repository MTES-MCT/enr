import { NotificationArgs } from '..'
import { UniqueEntityID } from '../../../core/domain'
import { makeProject } from '../../../entities'
import { None, Some } from '../../../types'
import makeFakeProject from '../../../__tests__/fixtures/project'
import makeFakeUser from '../../../__tests__/fixtures/user'
import { UserInvitedToProject } from '../../authorization'
import { handleUserInvitedToProject } from './handleUserInvitedToProject'

const userId = new UniqueEntityID().toString()
const projectId1 = new UniqueEntityID().toString()
const projectId2 = new UniqueEntityID().toString()

describe('notification.handleUserInvitedToProject', () => {
  it('should send an email to the PP', async () => {
    const sendNotification = jest.fn(async (args: NotificationArgs) => null)
    const findProjectById = jest.fn(async (projectId: string) =>
      projectId === projectId1
        ? makeProject(makeFakeProject({ nomProjet: 'nomProjet1' })).unwrap()
        : makeProject(makeFakeProject({ nomProjet: 'nomProjet2' })).unwrap()
    )
    const findUserById = jest.fn(async (userId: string) =>
      Some(makeFakeUser({ email: 'email@test.test', fullName: 'john doe' }))
    )

    await handleUserInvitedToProject({
      sendNotification,
      findUserById,
      findProjectById,
    })(
      new UserInvitedToProject({
        payload: {
          projectIds: [projectId1, projectId2],
          userId,
          invitedBy: userId,
        },
        original: {
          version: 1,
          occurredAt: new Date(1),
        },
      })
    )

    expect(sendNotification).toHaveBeenCalledTimes(1)
    const notifications = sendNotification.mock.calls.map((call) => call[0])
    expect(
      notifications.every(
        (notification) =>
          notification.type === 'project-invitation' &&
          notification.message.email === 'email@test.test' &&
          notification.message.name === 'john doe' &&
          notification.variables.nomProjet === 'nomProjet1, nomProjet2'
      )
    ).toBe(true)
  })
})
