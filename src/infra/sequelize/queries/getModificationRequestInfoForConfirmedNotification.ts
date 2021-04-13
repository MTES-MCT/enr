import { err, errAsync, ok, wrapInfra } from '../../../core/utils'
import {
  GetModificationRequestInfoForConfirmedNotification,
  ModificationRequestInfoForConfirmedNotificationDTO,
} from '../../../modules/modificationRequest'
import { EntityNotFoundError, InfraNotAvailableError } from '../../../modules/shared'

export const makeGetModificationRequestInfoForConfirmedNotification = (
  models
): GetModificationRequestInfoForConfirmedNotification => (modificationRequestId: string) => {
  const { ModificationRequest, Project, User } = models
  if (!ModificationRequest || !Project || !User) return errAsync(new InfraNotAvailableError())

  return wrapInfra(
    ModificationRequest.findByPk(modificationRequestId, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['nomProjet'],
        },
        {
          model: User,
          as: 'confirmationRequestedByUser',
          attributes: ['fullName', 'email', 'id'],
        },
      ],
    })
  ).andThen((modificationRequestRaw: any) => {
    if (!modificationRequestRaw) return err(new EntityNotFoundError())

    const {
      type,
      confirmationRequestedByUser: { email, fullName, id },
      project: { nomProjet },
    } = modificationRequestRaw.get()

    return ok({
      type,
      nomProjet,
      chargeAffaire: { id, email, fullName },
    } as ModificationRequestInfoForConfirmedNotificationDTO)
  })
}
