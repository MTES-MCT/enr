import {
  combine,
  err,
  errAsync,
  fromOldResult,
  logger,
  okAsync,
  Result,
  ResultAsync,
  combineWithAllErrors,
  wrapInfra,
  ok,
} from '../../../core/utils'
import { makeProjectAdmissionKey, Project, ProjectAdmissionKey, User } from '../../../entities'
import routes from '../../../routes'
import { InfraNotAvailableError, UnauthorizedError } from '../../shared'
import { UserWithEmailExistsAlreadyError } from '../errors'
import { GetUserByEmail } from '../queries'

interface InviteUserToProjectDeps {
  getUserByEmail: GetUserByEmail
  shouldUserAccessProject: (args: { user: User; projectId: Project['id'] }) => Promise<boolean>
  createUserCredentials: (args: {
    role: User['role']
    email: string
  }) => ResultAsync<string, InfraNotAvailableError>
  addProjectToUser: (args: {
    userId: string
    projectId: string
  }) => ResultAsync<null, InfraNotAvailableError>
}

interface InviteUserToProjectArgs {
  email: string
  invitedBy: User
  projectIds: string[]
}

export const makeInviteUserToProject = (deps: InviteUserToProjectDeps) => (
  args: InviteUserToProjectArgs
): ResultAsync<null, UnauthorizedError | InfraNotAvailableError> => {
  const { shouldUserAccessProject, getUserByEmail, createUserCredentials, addProjectToUser } = deps
  const { email, projectIds, invitedBy } = args

  return wrapInfra(
    Promise.all(
      projectIds.map((projectId) => shouldUserAccessProject({ user: invitedBy, projectId }))
    )
  )
    .andThen(
      (hasRightsForProject): Result<null, UnauthorizedError> => {
        if (hasRightsForProject.some((right) => !right)) {
          return err(new UnauthorizedError())
        }

        return ok(null)
      }
    )
    .andThen(() => getUserByEmail(email))
    .andThen(
      (userOrNull): ResultAsync<string, InfraNotAvailableError> => {
        if (userOrNull === null) {
          return createUserCredentials({ role: 'porteur-projet', email })
        }

        return okAsync(userOrNull.id)
      }
    )
    .andThen((userId) =>
      combine(projectIds.map((projectId) => addProjectToUser({ userId, projectId })))
    )
    .map(() => null)
}
