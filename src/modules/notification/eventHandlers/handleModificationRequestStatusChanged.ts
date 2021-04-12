import { NotificationService } from '..'
import { logger } from '../../../core/utils'
import routes from '../../../routes'
import {
  ConfirmationRequested,
  ModificationRequestAccepted,
  ModificationRequestInstructionStarted,
  ModificationRequestRejected,
} from '../../modificationRequest'
import { GetModificationRequestInfoForStatusNotification } from '../../modificationRequest/queries/GetModificationRequestInfoForStatusNotification'

export const handleModificationRequestStatusChanged = (deps: {
  sendNotification: NotificationService['sendNotification']
  getModificationRequestInfoForStatusNotification: GetModificationRequestInfoForStatusNotification
}) => async (
  event:
    | ModificationRequestAccepted
    | ModificationRequestInstructionStarted
    | ModificationRequestRejected
    | ConfirmationRequested
) => {
  const modificationRequestId = event.payload.modificationRequestId
  let status: string = 'mise à jour' // default
  let hasDocument: boolean = false
  switch (event.type) {
    case ModificationRequestAccepted.type:
      status = 'acceptée'
      hasDocument = true
      break
    case ModificationRequestInstructionStarted.type:
      status = 'en instruction'
      hasDocument = false
      break
    case ModificationRequestRejected.type:
      status = 'rejetée'
      hasDocument = true
      break
    case ConfirmationRequested.type:
      status = 'en attente de confirmation'
      hasDocument = true
      break
  }

  await deps.getModificationRequestInfoForStatusNotification(modificationRequestId).match(
    async ({ porteursProjet, nomProjet, type }) => {
      if (!porteursProjet || !porteursProjet.length) {
        // no registered user for this projet, no one to warn
        return
      }

      await Promise.all(
        porteursProjet.map(({ email, fullName, id }) =>
          _sendUpdateNotification({
            email,
            fullName,
            porteurId: id,
            typeDemande: type,
            nomProjet,
            modificationRequestId,
            status,
            hasDocument,
          })
        )
      )
    },
    (e: Error) => {
      logger.error(e)
    }
  )

  function _sendUpdateNotification(args: {
    email: string
    fullName: string
    typeDemande: string
    nomProjet: string
    modificationRequestId: string
    porteurId: string
    status: string
    hasDocument: boolean
  }) {
    const {
      email,
      fullName,
      typeDemande,
      nomProjet,
      modificationRequestId,
      porteurId,
      status,
      hasDocument,
    } = args
    return deps.sendNotification({
      type: 'modification-request-status-update',
      message: {
        email,
        name: fullName,
        subject: `Votre demande de ${typeDemande} pour le projet ${nomProjet}`,
      },
      context: {
        modificationRequestId,
        userId: porteurId,
      },
      variables: {
        nom_projet: nomProjet,
        type_demande: typeDemande,
        status,
        modification_request_url: routes.DEMANDE_PAGE_DETAILS(modificationRequestId),
        document_absent: hasDocument ? undefined : '', // injecting an empty string will prevent the default "with document" message to be injected in the email body
      },
    })
  }
}
