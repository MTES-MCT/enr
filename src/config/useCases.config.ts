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
} from './repos.config'
import {
  getFileProject,
  getProjectIdForAdmissionKey,
  getProjectIdsForPeriode,
} from './queries.config'
import { eventStore } from './eventStore.config'
import {
  makeAcceptModificationRequest,
  makeRejectModificationRequest,
  makeUpdateModificationRequestStatus,
  makeRequestConfirmation,
} from '../modules/modificationRequest'

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

export const regenerateCertificatesForPeriode = makeRegenerateCertificatesForPeriode({
  eventBus: eventStore,
  generateCertificate,
  projectRepo,
  getProjectIdsForPeriode,
})

export const importAppelOffreData = makeImportAppelOffreData({
  eventBus: eventStore,
  appelOffreRepo,
})

export const importPeriodeData = makeImportPeriodeData({
  eventBus: eventStore,
  appelOffreRepo,
})
