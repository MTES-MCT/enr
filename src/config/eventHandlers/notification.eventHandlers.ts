import {
  handleProjectCertificateUpdatedOrRegenerated,
  handleModificationRequestStatusChanged,
  handleModificationRequested,
  handleProjectGFSubmitted,
  handleModificationRequestConfirmed,
  handleModificationRequestCancelled,
  handleModificationReceived,
  handleNewRulesOptedIn,
} from '../../modules/notification'
import {
  ProjectCertificateRegenerated,
  ProjectCertificateUpdated,
  ProjectGFSubmitted,
  ProjectNewRulesOptedIn,
} from '../../modules/project/events'
import { projectRepo, oldProjectRepo } from '../repos.config'
import {
  getModificationRequestInfoForStatusNotification,
  getModificationRequestInfoForConfirmedNotification,
  getInfoForModificationRequested,
  getModificationRequestRecipient,
} from '../queries.config'
import { eventStore } from '../eventStore.config'
import { sendNotification } from '../emails.config'
import {
  ModificationRequested,
  ModificationRequestAccepted,
  ModificationRequestInstructionStarted,
  ModificationRequestRejected,
  ConfirmationRequested,
  ModificationRequestConfirmed,
  ModificationRequestCancelled,
  ModificationReceived,
} from '../../modules/modificationRequest'
import { userRepo } from '../../dataAccess'

const projectCertificateChangeHandler = handleProjectCertificateUpdatedOrRegenerated({
  sendNotification,
  projectRepo,
  getUsersForProject: oldProjectRepo.getUsers,
})

eventStore.subscribe(ProjectCertificateUpdated.type, projectCertificateChangeHandler)
eventStore.subscribe(ProjectCertificateRegenerated.type, projectCertificateChangeHandler)

const modificationRequestStatusChangeHandler = handleModificationRequestStatusChanged({
  sendNotification,
  getModificationRequestInfoForStatusNotification,
})
eventStore.subscribe(
  ModificationRequestInstructionStarted.type,
  modificationRequestStatusChangeHandler
)
eventStore.subscribe(ModificationRequestAccepted.type, modificationRequestStatusChangeHandler)
eventStore.subscribe(ModificationRequestRejected.type, modificationRequestStatusChangeHandler)
eventStore.subscribe(ConfirmationRequested.type, modificationRequestStatusChangeHandler)
eventStore.subscribe(ModificationRequestCancelled.type, modificationRequestStatusChangeHandler)

eventStore.subscribe(
  ModificationRequested.type,
  handleModificationRequested({
    sendNotification,
    getInfoForModificationRequested,
    findUsersForDreal: userRepo.findUsersForDreal,
    findProjectById: oldProjectRepo.findById,
  })
)

eventStore.subscribe(
  ModificationRequestConfirmed.type,
  handleModificationRequestConfirmed({
    sendNotification,
    getModificationRequestInfoForConfirmedNotification,
  })
)

eventStore.subscribe(
  ProjectGFSubmitted.type,
  handleProjectGFSubmitted({
    sendNotification,
    findUsersForDreal: userRepo.findUsersForDreal,
    findUserById: userRepo.findById,
    findProjectById: oldProjectRepo.findById,
  })
)

if (!process.env.DGEC_EMAIL) {
  console.error('ERROR: DGEC_EMAIL is not set')
  process.exit(1)
}

eventStore.subscribe(
  ModificationRequestCancelled.type,
  handleModificationRequestCancelled({
    sendNotification,
    findUsersForDreal: userRepo.findUsersForDreal,
    getModificationRequestInfo: getModificationRequestInfoForStatusNotification,
    getModificationRequestRecipient,
    dgecEmail: process.env.DGEC_EMAIL,
  })
)

eventStore.subscribe(
  ModificationReceived.type,
  handleModificationReceived({
    sendNotification,
    findUsersForDreal: userRepo.findUsersForDreal,
    findUserById: userRepo.findById,
    findProjectById: oldProjectRepo.findById,
  })
)

eventStore.subscribe(
  ProjectNewRulesOptedIn.type,
  handleNewRulesOptedIn({
    sendNotification,
    findUserById: userRepo.findById,
    findProjectById: oldProjectRepo.findById,
  })
)

console.log('Notification Event Handlers Initialized')
export const notificationHandlersOk = true
