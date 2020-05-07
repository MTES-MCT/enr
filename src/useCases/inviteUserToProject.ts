import _ from 'lodash'
import {
  CandidateNotificationRepo,
  CredentialsRepo,
  ProjectAdmissionKeyRepo,
  ProjectRepo,
  UserRepo,
  AppelOffreRepo,
} from '../dataAccess'
import {
  makeCandidateNotification,
  makeProjectAdmissionKey,
  Project,
  User,
  ProjectAdmissionKey,
  AppelOffre,
  Periode,
} from '../entities'
import { ErrorResult, Ok, ResultAsync, Err } from '../types'
import routes from '../routes'
import { importProjects } from '.'

interface EmailServiceProps {
  destinationEmail: string
  subject: string
  nomProjet: string
  invitationLink: string
}

interface MakeUseCaseProps {
  projectRepo: ProjectRepo
  credentialsRepo: CredentialsRepo
  projectAdmissionKeyRepo: ProjectAdmissionKeyRepo
  userRepo: UserRepo
  shouldUserAccessProject: (args: {
    user: User
    projectId: Project['id']
  }) => Promise<boolean>
  sendEmailInvitation: (props: EmailServiceProps) => Promise<void>
}

interface CallUseCaseProps {
  email: string
  user: User
  projectId: string
}

export const ACCESS_DENIED_ERROR =
  "Vous n'avez pas le droit d'inviter un utilisateur sur ce projet"

export const SYSTEM_ERROR =
  "Il y a eu un problème lors de l'invitation. Merci de réessayer."

export default function makeSendCandidateNotification({
  projectRepo,
  projectAdmissionKeyRepo,
  credentialsRepo,
  userRepo,
  shouldUserAccessProject,
  sendEmailInvitation,
}: MakeUseCaseProps) {
  return async function sendCandidateNotification({
    email,
    user,
    projectId,
  }: CallUseCaseProps): ResultAsync<null> {
    // Check if the user has the rights to this project
    const access = await shouldUserAccessProject({
      user,
      projectId,
    })

    if (!access) {
      return ErrorResult(ACCESS_DENIED_ERROR)
    }

    // Check if the email is already a known user
    const existingUserWithEmail = await credentialsRepo.findByEmail(email)

    if (existingUserWithEmail.is_some()) {
      // The user exists, add project to this user
      const { userId } = existingUserWithEmail.unwrap()
      const result = await userRepo.addProject(userId, projectId)
      if (result.is_err()) {
        console.log(
          'inviteUserToProject use-case failed on call to userRepo.addProject',
          result.unwrap_err()
        )
        return ErrorResult(SYSTEM_ERROR)
      }

      // Success
      return Ok(null)
    }

    // The invited user doesn't exist yet

    // Get project info
    const project = await projectRepo.findById(projectId)
    if (project.is_none()) {
      console.log(
        'inviteUserToProject use-case failed on call to projectRepo.findById'
      )
      return ErrorResult(SYSTEM_ERROR)
    }

    // Create a project admission key
    const projectAdmissionKeyResult = makeProjectAdmissionKey({
      email,
      projectId,
      fullName: '',
    })
    if (projectAdmissionKeyResult.is_err()) {
      console.log(
        'inviteUserToProject use-case failed on call to makeProjectAdmissionKey',
        projectAdmissionKeyResult.unwrap_err()
      )
      return ErrorResult(SYSTEM_ERROR)
    }
    const projectAdmissionKey = projectAdmissionKeyResult.unwrap()
    const projectAdmissionKeyInsertion = await projectAdmissionKeyRepo.insert(
      projectAdmissionKey
    )
    if (projectAdmissionKeyInsertion.is_err()) {
      console.log(
        'inviteUserToProject use-case failed on call to projectAdmissionKeyRepo.insert',
        projectAdmissionKeyResult.unwrap_err()
      )
      return ErrorResult(SYSTEM_ERROR)
    }

    // Send email invitation

    // Call sendEmailInvitation with the proper informations
    try {
      await sendEmailInvitation({
        subject: `${user.fullName} vous invite à rejoindre Potentiel`,
        destinationEmail: email,
        nomProjet: project.unwrap().nomProjet,
        invitationLink: routes.PROJECT_INVITATION({
          projectAdmissionKey: projectAdmissionKey.id,
        }),
      })
      return Ok(null)
    } catch (error) {
      console.log(
        'inviteUserToProject use-case: error when calling sendEmailInvitation',
        error
      )
      return Err(error)
    }
  }
}