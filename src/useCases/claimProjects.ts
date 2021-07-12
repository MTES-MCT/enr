import { logger } from '../core/utils'
import { CredentialsRepo, ProjectAdmissionKeyRepo, UserRepo } from '../dataAccess'
import { DREAL, makeProjectAdmissionKey, User } from '../entities'
import { NotificationService } from '../modules/notification'
import routes from '../routes'
import { Err, ErrorResult, Ok, ResultAsync } from '../types'

interface MakeUseCaseProps {
  credentialsRepo: CredentialsRepo
  projectAdmissionKeyRepo: ProjectAdmissionKeyRepo
  userRepo: UserRepo
  sendNotification: NotificationService['sendNotification']
}

interface CallUseCaseProps {
  email: string
  region: DREAL
  user: User
}

export const ACCESS_DENIED_ERROR = "Vous n'avez pas le droit d'inviter un utilisateur DREAL"

export const SYSTEM_ERROR = "Il y a eu un problème lors de l'invitation. Merci de réessayer."

export default function makeClaimProjects({
  credentialsRepo,
  projectAdmissionKeyRepo,
  userRepo,
  sendNotification,
}: MakeUseCaseProps) {
  return async function claimProjects({
    email,
    user,
    region,
  }: CallUseCaseProps): ResultAsync<null> {
    const access = user.role === 'porteur-projet'

    if (!access) {
      return ErrorResult(ACCESS_DENIED_ERROR)
    }

    // Check if the email is already a known user
    const existingUserWithEmail = await credentialsRepo.findByEmail(email)

    if (existingUserWithEmail.is_some()) {
      // The user exists, add dreal to this user
      const { userId } = existingUserWithEmail.unwrap()
      const result = await userRepo.addToDreal(userId, region)
      if (result.is_err()) {
        logger.error(result.unwrap_err())
        return ErrorResult(SYSTEM_ERROR)
      }

      return Ok(null)
    }

    // The invited user doesn't exist yet

    // Create a project admission key
    const projectAdmissionKeyResult = makeProjectAdmissionKey({
      email,
      dreal: region,
      fullName: '',
    })
    if (projectAdmissionKeyResult.is_err()) {
      logger.error(projectAdmissionKeyResult.unwrap_err())
      return ErrorResult(SYSTEM_ERROR)
    }
    const projectAdmissionKey = projectAdmissionKeyResult.unwrap()
    const projectAdmissionKeyInsertion = await projectAdmissionKeyRepo.save(projectAdmissionKey)
    if (projectAdmissionKeyInsertion.is_err()) {
      logger.error(projectAdmissionKeyResult.unwrap_err())
      return ErrorResult(SYSTEM_ERROR)
    }

    // Send email invitation

    // Call sendDrealInvitation with the proper informations
    try {
      await sendNotification({
        type: 'dreal-invitation',
        message: {
          email,
          subject: `${user.fullName} vous invite à suivre les projets de votre région sur Potentiel`,
        },
        context: {
          projectAdmissionKeyId: projectAdmissionKey.id,
          dreal: region,
        },
        variables: {
          invitation_link: routes.DREAL_INVITATION({
            projectAdmissionKey: projectAdmissionKey.id,
          }),
        },
      })
      return Ok(null)
    } catch (error) {
      logger.error(error)
      return Err(error)
    }
  }
}
