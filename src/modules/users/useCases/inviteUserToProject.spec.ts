import { UniqueEntityID } from '../../../core/domain'
import { okAsync } from '../../../core/utils'
import { User } from '../../../entities'
import makeFakeUser from '../../../__tests__/fixtures/user'
import { InfraNotAvailableError } from '../../shared'
import { makeInviteUserToProject } from './inviteUserToProject'

describe('inviteUserToProject use-case', () => {
  const fakeUser: User = makeFakeUser()
  const fakeEmail = 'test@test.test'
  const fakeProjectId = new UniqueEntityID().toString()

  describe('when inviting user has rights on the projects', () => {
    const shouldUserAccessProject = jest.fn(async (args: { user: User; projectId: string }) => true)

    describe('when invited email is not an existing user', () => {
      const newUserId = new UniqueEntityID().toString()
      const getUserByEmail = jest.fn((email: string) =>
        okAsync<User | null, InfraNotAvailableError>(null)
      )
      const createUserCredentials = jest.fn((args: { role: User['role']; email: string }) =>
        okAsync<string, InfraNotAvailableError>(newUserId)
      )
      const addProjectToUser = jest.fn((args: { userId: string; projectId: string }) =>
        okAsync<null, InfraNotAvailableError>(null)
      )

      const inviteUserToProject = makeInviteUserToProject({
        getUserByEmail,
        shouldUserAccessProject,
        createUserCredentials,
        addProjectToUser,
      })

      beforeAll(async () => {
        const res = await inviteUserToProject({
          email: fakeEmail,
          invitedBy: fakeUser,
          projectIds: [fakeProjectId],
        })
        expect(res.isOk()).toBe(true)
      })

      it('should create new credentials for this email', () => {
        expect(createUserCredentials).toHaveBeenCalledWith({
          role: 'porteur-projet',
          email: fakeEmail,
        })
      })

      it('add each project to the newly created user', () => {
        expect(addProjectToUser).toHaveBeenCalledWith({
          userId: newUserId,
          projectId: fakeProjectId,
        })
      })
    })

    describe('when invited email is an existing user', () => {
      const userWithEmail: User = makeFakeUser({ id: new UniqueEntityID().toString() })
      const getUserByEmail = jest.fn((email: string) =>
        okAsync<User | null, InfraNotAvailableError>(userWithEmail)
      )
      const createUserCredentials = jest.fn()
      const addProjectToUser = jest.fn((args: { userId: string; projectId: string }) =>
        okAsync<null, InfraNotAvailableError>(null)
      )

      const inviteUserToProject = makeInviteUserToProject({
        getUserByEmail,
        shouldUserAccessProject,
        createUserCredentials,
        addProjectToUser,
      })

      beforeAll(async () => {
        const res = await inviteUserToProject({
          email: fakeEmail,
          invitedBy: fakeUser,
          projectIds: [fakeProjectId],
        })
        expect(res.isOk()).toBe(true)
      })

      it('should use the existing credentials for this email', () => {
        expect(getUserByEmail).toHaveBeenCalledWith(fakeEmail)
        expect(createUserCredentials).not.toHaveBeenCalled()
      })

      it('add each project to the existing user', () => {
        expect(addProjectToUser).toHaveBeenCalledWith({
          userId: userWithEmail.id,
          projectId: fakeProjectId,
        })
      })
    })
  })

  describe('when inviting user has no rights on the projects', () => {
    const shouldUserAccessProject = jest.fn(
      async (args: { user: User; projectId: string }) => false
    )

    const getUserByEmail = jest.fn()
    const createUserCredentials = jest.fn()
    const addProjectToUser = jest.fn()

    const inviteUserToProject = makeInviteUserToProject({
      getUserByEmail,
      shouldUserAccessProject,
      createUserCredentials,
      addProjectToUser,
    })

    it('should return UnauthorizedError', async () => {
      const res = await inviteUserToProject({
        email: fakeEmail,
        invitedBy: fakeUser,
        projectIds: [fakeProjectId],
      })
      expect(res.isErr()).toBe(true)

      expect(createUserCredentials).not.toHaveBeenCalled()
      expect(addProjectToUser).not.toHaveBeenCalled()
    })
  })
})
