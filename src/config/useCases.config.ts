import { makeImportAppelOffreData, makeImportPeriodeData } from '../modules/appelOffre/useCases'
import { BaseShouldUserAccessProject, makeRevokeRightsToProject } from '../modules/authorization'
import { makeLoadFileForUser } from '../modules/file'
import {
  makeAcceptModificationRequest,
  makeCancelModificationRequest,
  makeConfirmRequest,
  makeRejectModificationRequest,
  makeRequestActionnaireModification,
  makeRequestConfirmation,
  makeRequestFournisseursModification,
  makeRequestProducteurModification,
  makeRequestPuissanceModification,
  makeUpdateModificationRequestStatus,
} from '../modules/modificationRequest'
import { getAutoAcceptRatiosForAppelOffre } from '../modules/modificationRequest/helpers'
import {
  makeCorrectProjectData,
  makeGenerateCertificate,
  makeRegenerateCertificatesForPeriode,
  makeRemoveStep,
  makeSubmitStep,
  makeUpdateStepStatus,
} from '../modules/project/useCases'
import {
  makeCreateUser,
  makeInviteUserToProject,
  makeRegisterFirstUserLogin,
  makeRelanceInvitation,
} from '../modules/users'
import { buildCertificate } from '../views/certificates'
import { createUserCredentials, getUserName, resendInvitationEmail } from './credentials.config'
import { eventStore } from './eventStore.config'
import {
  getAppelOffreList,
  getFileProject,
  getProjectIdsForPeriode,
  getProjectsByContactEmail,
  getUserByEmail,
} from './queries.config'
import {
  appelOffreRepo,
  fileRepo,
  modificationRequestRepo,
  oldProjectRepo,
  oldUserRepo,
  projectRepo,
  userRepo,
} from './repos.config'

export const shouldUserAccessProject = new BaseShouldUserAccessProject(
  oldUserRepo,
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

export const requestProducteurModification = makeRequestProducteurModification({
  eventBus: eventStore,
  shouldUserAccessProject: shouldUserAccessProject.check.bind(shouldUserAccessProject),
  projectRepo,
  fileRepo,
})

export const requestFournisseurModification = makeRequestFournisseursModification({
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

export const createUser = makeCreateUser({
  getUserByEmail,
  createUserCredentials,
  eventBus: eventStore,
  getProjectsByContactEmail,
})

export const inviteUserToProject = makeInviteUserToProject({
  getUserByEmail,
  shouldUserAccessProject: shouldUserAccessProject.check.bind(shouldUserAccessProject),
  eventBus: eventStore,
  createUser,
})

export const registerFirstUserLogin = makeRegisterFirstUserLogin({
  userRepo,
  getUserName,
})

export const relanceInvitation = makeRelanceInvitation({
  eventBus: eventStore,
  resendInvitationEmail,
})

export const cancelModificationRequest = makeCancelModificationRequest({
  shouldUserAccessProject: shouldUserAccessProject.check.bind(shouldUserAccessProject),
  modificationRequestRepo,
})
