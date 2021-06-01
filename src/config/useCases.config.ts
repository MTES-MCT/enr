import {
  BaseShouldUserAccessProject,
  makeRevokeRightsToProject,
  makeCancelInvitationToProject,
} from '../modules/authorization'
import { makeLoadFileForUser } from '../modules/file'
import {
  makeCorrectProjectData,
  makeGenerateCertificate,
  makeSubmitStep,
  makeRemoveStep,
  makeRegenerateCertificatesForPeriode,
  makeUpdateStepStatus,
} from '../modules/project/useCases'
import { makeImportAppelOffreData, makeImportPeriodeData } from '../modules/appelOffre/useCases'
import { buildCertificate } from '../views/certificates'
import {
  fileRepo,
  oldProjectRepo,
  projectRepo,
  userRepo,
  modificationRequestRepo,
  appelOffreRepo,
  projectAdmissionKeyRepo,
} from './repos.config'
import {
  getFileProject,
  getProjectIdForAdmissionKey,
  getProjectIdsForPeriode,
  getAppelOffreList,
  getUserByEmail,
} from './queries.config'
import { eventStore } from './eventStore.config'
import { createUserCredentials } from './credentials.config'
import {
  makeAcceptModificationRequest,
  makeRejectModificationRequest,
  makeRequestPuissanceModification,
  makeRequestActionnaireModification,
  makeUpdateModificationRequestStatus,
  makeRequestConfirmation,
  makeConfirmRequest,
  makeCancelModificationRequest,
} from '../modules/modificationRequest'
import { getAutoAcceptRatiosForAppelOffre } from '../modules/modificationRequest/helpers'
import { makeInviteUser, makeInviteUserToProject } from '../modules/users'
import { sendNotification } from './emails.config'
import { fromOldResult, fromOldResultAsync } from '../core/utils'
import { InfraNotAvailableError } from '../modules/shared'

export const shouldUserAccessProject = new BaseShouldUserAccessProject(
  userRepo,
  oldProjectRepo.findById
)

export const generateCertificate = makeGenerateCertificate({
  fileRepo,
  projectRepo,
  buildCertificate,
})

export const correctProjectData = makeCorrectProjectData({
  fileRepo,
  projectRepo,
  generateCertificate,
})

export const loadFileForUser = makeLoadFileForUser({
  fileRepo,
  shouldUserAccessProject,
  getFileProject,
})

export const acceptModificationRequest = makeAcceptModificationRequest({
  fileRepo,
  projectRepo,
  modificationRequestRepo,
})
export const rejectModificationRequest = makeRejectModificationRequest({
  fileRepo,
  modificationRequestRepo,
})
export const requestConfirmation = makeRequestConfirmation({
  fileRepo,
  modificationRequestRepo,
})
export const updateModificationRequestStatus = makeUpdateModificationRequestStatus({
  modificationRequestRepo,
})

export const confirmRequest = makeConfirmRequest({
  modificationRequestRepo,
  shouldUserAccessProject: shouldUserAccessProject.check.bind(shouldUserAccessProject),
})

export const revokeUserRightsToProject = makeRevokeRightsToProject({
  eventBus: eventStore,
  shouldUserAccessProject: shouldUserAccessProject.check.bind(shouldUserAccessProject),
})

export const cancelInvitationToProject = makeCancelInvitationToProject({
  eventBus: eventStore,
  shouldUserAccessProject: shouldUserAccessProject.check.bind(shouldUserAccessProject),
  getProjectIdForAdmissionKey,
})

export const submitStep = makeSubmitStep({
  eventBus: eventStore,
  fileRepo,
  shouldUserAccessProject: shouldUserAccessProject.check.bind(shouldUserAccessProject),
})

export const removeStep = makeRemoveStep({
  eventBus: eventStore,
  shouldUserAccessProject: shouldUserAccessProject.check.bind(shouldUserAccessProject),
})

export const updateStepStatus = makeUpdateStepStatus({
  eventBus: eventStore,
  shouldUserAccessProject: shouldUserAccessProject.check.bind(shouldUserAccessProject),
})

export const requestPuissanceModification = makeRequestPuissanceModification({
  eventBus: eventStore,
  shouldUserAccessProject: shouldUserAccessProject.check.bind(shouldUserAccessProject),
  getAutoAcceptRatiosForAppelOffre,
  projectRepo,
  fileRepo,
})

export const requestActionnaireModification = makeRequestActionnaireModification({
  eventBus: eventStore,
  shouldUserAccessProject: shouldUserAccessProject.check.bind(shouldUserAccessProject),
  projectRepo,
  fileRepo,
})

export const regenerateCertificatesForPeriode = makeRegenerateCertificatesForPeriode({
  eventBus: eventStore,
  generateCertificate,
  projectRepo,
  getProjectIdsForPeriode,
})

export const importAppelOffreData = makeImportAppelOffreData({
  eventBus: eventStore,
  appelOffreRepo,
  getAppelOffreList,
})

export const importPeriodeData = makeImportPeriodeData({
  eventBus: eventStore,
  appelOffreRepo,
})

export const inviteUser = makeInviteUser({
  projectAdmissionKeyRepo,
  getUserByEmail,
  sendNotification,
})

const addProjectToUser = (args: { userId: string; projectId: string }) => {
  const { userId, projectId } = args
  return fromOldResultAsync(userRepo.addProject(userId, projectId)).mapErr(
    () => new InfraNotAvailableError()
  )
}

export const inviteUserToProject = makeInviteUserToProject({
  getUserByEmail,
  shouldUserAccessProject: shouldUserAccessProject.check.bind(shouldUserAccessProject),
  addProjectToUser,
  createUserCredentials,
})

export const cancelModificationRequest = makeCancelModificationRequest({
  shouldUserAccessProject: shouldUserAccessProject.check.bind(shouldUserAccessProject),
  modificationRequestRepo,
})
