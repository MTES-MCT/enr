import makeLogin from './login'
import makeImportProjects from './importProjects'
import makeListProjects from './listProjects'
import makeSignup from './signup'
import makeRequestModification from './requestModification'
import makeListUnnotifiedProjects from './listUnnotifiedProjects'
import makeGetUserProject from './getUserProject'
import makeRetrievePassword from './retrievePassword'
import makeResetPassword from './resetPassword'
import makeShouldUserAccessProject from './shouldUserAccessProject'
import makeInviteUserToProject from './inviteUserToProject'
import makeInviteDreal from './inviteDreal'
import makeRelanceInvitations from './relanceInvitations'
import makeRelanceGarantiesFinancieres from './relanceGarantiesFinancieres'

import { fileRepo, sendNotification, eventStore, getProjectAppelOffreId } from '../config'

import {
  credentialsRepo,
  userRepo,
  projectRepo,
  projectAdmissionKeyRepo,
  appelOffreRepo,
  passwordRetrievalRepo,
} from '../dataAccess'
import makeClaimProjects from './claimProjects'

const login = makeLogin({
  credentialsRepo,
  userRepo,
})

const importProjects = makeImportProjects({
  eventBus: eventStore,
  findOneProject: projectRepo.findOne,
  saveProject: projectRepo.save,
  removeProject: projectRepo.remove,
  addProjectToUserWithEmail: userRepo.addProjectToUserWithEmail,
  appelOffreRepo,
})

const listProjects = makeListProjects({
  searchForRegions: projectRepo.searchForRegions,
  findAllForRegions: projectRepo.findAllForRegions,
  searchForUser: projectRepo.searchForUser,
  findAllForUser: projectRepo.findAllForUser,
  searchAll: projectRepo.searchAll,
  findAll: projectRepo.findAll,
  findExistingAppelsOffres: projectRepo.findExistingAppelsOffres,
  findExistingPeriodesForAppelOffre: projectRepo.findExistingPeriodesForAppelOffre,
  findExistingFamillesForAppelOffre: projectRepo.findExistingFamillesForAppelOffre,
  findDrealsForUser: userRepo.findDrealsForUser,
})
const listUnnotifiedProjects = makeListUnnotifiedProjects({
  findAllProjects: projectRepo.findAll,
  findExistingAppelsOffres: projectRepo.findExistingAppelsOffres,
  findExistingPeriodesForAppelOffre: projectRepo.findExistingPeriodesForAppelOffre,
  countUnnotifiedProjects: projectRepo.countUnnotifiedProjects,
  searchAllProjects: projectRepo.searchAll,
  appelOffreRepo,
})

const shouldUserAccessProject = makeShouldUserAccessProject({
  userRepo,
  findProjectById: projectRepo.findById,
})

const signup = makeSignup({
  userRepo,
  addUserToProjectsWithEmail: userRepo.addUserToProjectsWithEmail,
  addUserToProject: userRepo.addProject,
  credentialsRepo,
  projectAdmissionKeyRepo,
})

const requestModification = makeRequestModification({
  fileRepo,
  eventBus: eventStore,
  shouldUserAccessProject,
  getProjectAppelOffreId,
})

const getUserProject = makeGetUserProject({
  findProjectById: projectRepo.findById,
  shouldUserAccessProject,
})

const retrievePassword = makeRetrievePassword({
  credentialsRepo,
  passwordRetrievalRepo,
  sendNotification,
})

const resetPassword = makeResetPassword({
  credentialsRepo,
  passwordRetrievalRepo,
})

const inviteUserToProject = makeInviteUserToProject({
  findProjectById: projectRepo.findById,
  credentialsRepo,
  userRepo,
  projectAdmissionKeyRepo,
  shouldUserAccessProject,
  sendNotification,
})

const inviteDreal = makeInviteDreal({
  credentialsRepo,
  projectAdmissionKeyRepo,
  userRepo,
  sendNotification,
})

const claimProjects = makeClaimProjects({
  credentialsRepo,
  projectAdmissionKeyRepo,
  userRepo,
  sendNotification,
})

const relanceInvitations = makeRelanceInvitations({
  projectAdmissionKeyRepo,
  sendNotification,
})

const relanceGarantiesFinancieres = makeRelanceGarantiesFinancieres({
  eventBus: eventStore,
  findProjectsWithGarantiesFinancieresPendingBefore:
    projectRepo.findProjectsWithGarantiesFinancieresPendingBefore,
  getUsersForProject: projectRepo.getUsers,
  saveProject: projectRepo.save,
  sendNotification,
})

const useCases = Object.freeze({
  login,
  importProjects,
  listProjects,
  sendNotification,
  signup,
  requestModification,
  listUnnotifiedProjects,
  getUserProject,
  retrievePassword,
  resetPassword,
  shouldUserAccessProject,
  inviteUserToProject,
  inviteDreal,
  relanceInvitations,
  relanceGarantiesFinancieres,
  claimProjects,
})

export default useCases
export {
  login,
  importProjects,
  listProjects,
  sendNotification,
  signup,
  requestModification,
  listUnnotifiedProjects,
  getUserProject,
  retrievePassword,
  resetPassword,
  shouldUserAccessProject,
  inviteUserToProject,
  inviteDreal,
  relanceInvitations,
  relanceGarantiesFinancieres,
  claimProjects,
}
