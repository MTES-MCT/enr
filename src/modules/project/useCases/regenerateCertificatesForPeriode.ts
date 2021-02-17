import { TransactionalRepository, UniqueEntityID } from '../../../core/domain'
import { errAsync, logger, okAsync, Result, ResultAsync } from '../../../core/utils'
import { User } from '../../../entities'
import { EventBus } from '../../eventStore'
import { InfraNotAvailableError, UnauthorizedError } from '../../shared'
import { IllegalProjectDataError, ProjectCannotBeUpdatedIfUnnotifiedError } from '../errors'
import { CertificatesForPeriodeRegenerated } from '../events'
import { Project } from '../Project'
import { GetProjectIdsForPeriode } from '../queries'
import { GenerateCertificate } from './generateCertificate'

interface RegenerateCertificatesForPeriodeDeps {
  eventBus: EventBus
  getProjectIdsForPeriode: GetProjectIdsForPeriode
  projectRepo: TransactionalRepository<Project>
  generateCertificate: GenerateCertificate
}

interface RegenerateCertificatesForPeriodeArgs {
  appelOffreId: string
  periodeId: string
  newNotifiedOn?: number
  user: User
  reason?: string
}

export const makeRegenerateCertificatesForPeriode = (
  deps: RegenerateCertificatesForPeriodeDeps
) => (
  args: RegenerateCertificatesForPeriodeArgs
): ResultAsync<null, InfraNotAvailableError | UnauthorizedError> => {
  const { appelOffreId, periodeId, newNotifiedOn, user, reason } = args

  if (!user || !['admin', 'dgec'].includes(user.role)) {
    return errAsync(new UnauthorizedError())
  }

  return deps
    .getProjectIdsForPeriode({ appelOffreId, periodeId })
    .andThen((projectIds) =>
      ResultAsync.fromPromise(
        Promise.all(
          projectIds.map((projectId) =>
            _updateNotificationDateIfNecessary(projectId).andThen(() =>
              deps.generateCertificate(projectId, reason).mapErr((e) => {
                logger.info(`regenerateCertificatesForPeriode failed for projectId ${projectId}`)
                logger.error(e)
              })
            )
          )
        ),
        () => new InfraNotAvailableError()
      )
    )
    .andThen(() =>
      deps.eventBus.publish(
        new CertificatesForPeriodeRegenerated({
          payload: {
            appelOffreId,
            periodeId,
            reason,
            newNotifiedOn,
            requestedBy: user.id,
          },
        })
      )
    )
    .map(() => null)

  function _updateNotificationDateIfNecessary(projectId: string) {
    if (!newNotifiedOn) return okAsync(null)

    return deps.projectRepo.transaction(
      new UniqueEntityID(projectId),
      (
        project: Project
      ): Result<null, ProjectCannotBeUpdatedIfUnnotifiedError | IllegalProjectDataError> => {
        return project.setNotificationDate(user, newNotifiedOn)
      }
    )
  }
}
