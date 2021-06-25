import models from '../models'
import { oldUserRepo } from '../../../config/repos.config'
import { makeGetUnnotifiedProjectsForPeriode } from './getUnnotifiedProjectsForPeriode'
import { makeGetModificationRequestDetails } from './getModificationRequestDetails'
import { makeGetModificationRequestStatus } from './getModificationRequestStatus'
import { makeGetModificationRequestUpdateInfo } from './getModificationRequestInfoForStatusNotification'
import { makeGetModificationRequestInfoForConfirmedNotification } from './getModificationRequestInfoForConfirmedNotification'
import { makeGetFileProject } from './getFileProject'
import { makeGetFailedNotificationsForRetry } from './getFailedNotificationsForRetry'
import { makeGetFailedNotificationDetails } from './getFailedNotificationDetails'
import { makeGetModificationRequestListForUser } from './getModificationRequestListForUser'
import { makeGetInfoForModificationRequested } from './getInfoForModificationRequested'
import { makeGetProjectDataForProjectPage } from './getProjectDataForProjectPage'
import { makeGetProjectIdsForPeriode } from './getProjectIdsForPeriode'
import { makeGetModificationRequestDataForResponseTemplate } from './getModificationRequestDataForResponseTemplate'
import { makeGetAppelOffre } from './getAppelOffre'
import { makeGetPeriode } from './getPeriode'
import { makeGetPeriodeList } from './getPeriodeList'
import { makeGetAppelOffreList } from './getAppelOffreList'
import { makeGetUserByEmail } from './getUserByEmail'
import { makeGetModificationRequestRecipient } from './getModificationRequestRecipient'
import { makeGetProjectsByContactEmail } from './getProjectsByContactEmail'

export const getAppelOffre = makeGetAppelOffre(models)
export const getAppelOffreList = makeGetAppelOffreList(models)
export const getPeriode = makeGetPeriode(models)
export const getPeriodeList = makeGetPeriodeList(models)
export const getUserByEmail = makeGetUserByEmail(models)

export const getUnnotifiedProjectsForPeriode = makeGetUnnotifiedProjectsForPeriode(models)
export const getModificationRequestDetails = makeGetModificationRequestDetails(models)
export const getModificationRequestStatus = makeGetModificationRequestStatus(models)
export const getModificationRequestInfoForStatusNotification = makeGetModificationRequestUpdateInfo(
  models
)
export const getModificationRequestInfoForConfirmedNotification = makeGetModificationRequestInfoForConfirmedNotification(
  models
)
export const getModificationRequestListForUser = makeGetModificationRequestListForUser(models)

export const getFileProject = makeGetFileProject(models)
export const getFailedNotificationsForRetry = makeGetFailedNotificationsForRetry(models)
export const getFailedNotificationDetails = makeGetFailedNotificationDetails(models)
export const getInfoForModificationRequested = makeGetInfoForModificationRequested(models)
export const getProjectDataForProjectPage = makeGetProjectDataForProjectPage(models)
export const getProjectIdsForPeriode = makeGetProjectIdsForPeriode(models)
export const getProjectsByContactEmail = makeGetProjectsByContactEmail(models)
export const getModificationRequestDataForResponseTemplate = makeGetModificationRequestDataForResponseTemplate(
  {
    models,
    getPeriode,
    findDrealsForUser: oldUserRepo['findDrealsForUser'],
    dgecEmail: process.env.DGEC_EMAIL || '',
  }
)
export const getModificationRequestRecipient = makeGetModificationRequestRecipient(models)

export * from './candidateNotification'
