import {
  appelOffreRepo,
  userRepo,
  appelsOffreStatic,
  candidateNotificationRepo,
  projectAdmissionKeyRepo,
  credentialsRepo,
  projectRepo,
  resetDatabase,
} from '../dataAccess/inMemory'
import {
  makeProject,
  makeCredentials,
  makeUser,
  User,
  Project,
} from '../entities'
import makeFakeProject from '../__tests__/fixtures/project'
import makeFakeUser from '../__tests__/fixtures/user'
import makeInviteDreal, { ACCESS_DENIED_ERROR } from './inviteDreal'
import {
  resetEmailStub,
  sendDrealInvitation,
  getCallsToEmailStub,
} from '../__tests__/fixtures/drealInvitationService'
import routes from '../routes'

const inviteDreal = makeInviteDreal({
  credentialsRepo,
  userRepo,
  projectAdmissionKeyRepo,
  sendDrealInvitation,
})

describe('inviteDreal use-case', () => {
  let user: User = makeFakeUser({ role: 'admin' })

  beforeEach(async () => {
    resetDatabase()
    resetEmailStub()
  })

  it('should send an invitation link to the invited user if he has not account yet', async () => {
    const email = 'non-existing@user.test'

    const result = await inviteDreal({
      email,
      region: 'Corse',
      user,
    })

    expect(result.is_ok()).toBeTruthy()

    // Make sure a projectAdmissionKey has been created
    const projectAdmissionKeys = await projectAdmissionKeyRepo.findAll()
    expect(projectAdmissionKeys).toHaveLength(1)
    const projectAdmissionKey = projectAdmissionKeys[0]

    expect(projectAdmissionKey.email).toEqual(email)
    expect(projectAdmissionKey.dreal).toEqual('Corse')

    // Make sure an invitation has been sent
    expect(getCallsToEmailStub()).toHaveLength(1)

    const sentEmail = getCallsToEmailStub()[0]

    expect(sentEmail.destinationEmail).toEqual(email)
    expect(sentEmail.invitationLink).toContain(projectAdmissionKey.id)
  })

  it('should add rights to the dreal if user exists', async () => {
    // Reset email stub
    resetEmailStub()

    const email = 'existing@user.test'

    const insertedUsers = (
      await Promise.all(
        [
          {
            email,
            fullName: 'test',
            role: 'dreal',
          },
        ]
          .map(makeUser)
          .filter((item) => item.is_ok())
          .map((item) => item.unwrap())
          .map(userRepo.insert)
      )
    )
      .filter((item) => item.is_ok())
      .map((item) => item.unwrap())

    expect(insertedUsers).toHaveLength(1)
    const existingUser = insertedUsers[0]
    if (!existingUser) return

    const insertedCredentials = (
      await Promise.all(
        [
          {
            email,
            userId: existingUser.id,
            password: 'password',
          },
        ]
          .map(makeCredentials)
          .filter((item) => item.is_ok())
          .map((item) => item.unwrap())
          .map(credentialsRepo.insert)
      )
    )
      .filter((item) => item.is_ok())
      .map((item) => item.unwrap())

    expect(insertedCredentials).toHaveLength(1)

    const result = await inviteDreal({
      email,
      region: 'Corse',
      user,
    })

    expect(result.is_ok()).toBeTruthy()

    // Make sure user is now attached to this dreal
    const drealsForUser = await userRepo.findDrealsForUser(existingUser.id)
    expect(drealsForUser).toHaveLength(1)
    expect(drealsForUser[0]).toEqual('Corse')

    // Make sure the notification has been sent
    expect(getCallsToEmailStub()).toHaveLength(1)

    const sentEmail = getCallsToEmailStub()[0]

    expect(sentEmail.destinationEmail).toEqual(email)
    expect(sentEmail.invitationLink).toEqual(routes.ADMIN_LIST_PROJECTS)
  })
})
