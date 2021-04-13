import { NotificationService } from '..'
import { logger } from '../../../core/utils'
import routes from '../../../routes'
import {
  ConfirmationRequested,
  ModificationRequestAccepted,
  ModificationRequestConfirmed,
  ModificationRequestInstructionStarted,
  ModificationRequestRejected,
} from '../../modificationRequest'
import { GetModificationRequestInfoForConfirmedNotification } from '../../modificationRequest/queries'

export const handleModificationRequestConfirmed = (deps: {
  sendNotification: NotificationService['sendNotification']
  getModificationRequestInfoForConfirmedNotification: GetModificationRequestInfoForConfirmedNotification
}) => async (event: ModificationRequestConfirmed) => {
  const { modificationRequestId } = event.payload

  await deps.getModificationRequestInfoForConfirmedNotification(modificationRequestId).match(
    async ({ chargeAffaire, nomProjet, type }) => {
      if (!chargeAffaire) {
        // no registered user for this projet, no one to warn
        return
      }

      const { email, fullName, id } = chargeAffaire

      return deps.sendNotification({
        type: 'modification-request-confirmed',
        message: {
          email,
          name: fullName,
          subject: `Demande confirmée pour le projet ${nomProjet.toLowerCase()}`,
        },
        context: {
          modificationRequestId,
          userId: id,
        },
        variables: {
          nom_projet: nomProjet,
          type_demande: type,
          modification_request_url: routes.DEMANDE_PAGE_DETAILS(modificationRequestId),
        },
      })
    },
    (e: Error) => {
      logger.error(e)
    }
  )
}
