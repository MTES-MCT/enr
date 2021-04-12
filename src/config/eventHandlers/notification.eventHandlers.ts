import {
  handleProjectCertificateUpdatedOrRegenerated,
  handleModificationRequestStatusChanged,
  handleModificationRequested,
  handleProjectGFSubmitted,
} from '../../modules/notification'
import {
  ProjectCertificateRegenerated,
  ProjectCertificateUpdated,
  ProjectGFSubmitted,
} from '../../modules/project/events'
import { projectRepo, oldProjectRepo } from '../repos.config'
import {
  getModificationRequestInfoForStatusNotification,
  getInfoForModificationRequested,
} from '../queries.config'
import { eventStore } from '../eventStore.config'
import { sendNotification } from '../emails.config'
import {
  ModificationRequested,
  ModificationRequestAccepted,
  ModificationRequestInstructionStarted,
  ModificationRequestRejected,
  ConfirmationRequested,
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

eventStore.subscribe(
  ModificationRequested.type,
  handleModificationRequested({
    sendNotification,
    getInfoForModificationRequested,
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

console.log('Notification Event Handlers Initialized')
export const notificationHandlersOk = true
