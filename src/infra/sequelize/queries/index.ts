import models from '../models'
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
import { makeGetProjectIdForAdmissionKey } from './getProjectIdForAdmissionKey'
import { makeGetProjectDataForProjectPage } from './getProjectDataForProjectPage'
import { makeGetProjectIdsForPeriode } from './getProjectIdsForPeriode'
import { makeGetModificationRequestDataForResponseTemplate } from './getModificationRequestDataForResponseTemplate'
import { makeGetAppelOffre } from './getAppelOffre'
import { makeGetPeriode } from './getPeriode'
import { makeGetPeriodeList } from './getPeriodeList'
import { makeGetAppelOffreList } from './getAppelOffreList'

export const getAppelOffre = makeGetAppelOffre(models)
export const getAppelOffreList = makeGetAppelOffreList(models)
export const getPeriode = makeGetPeriode(models)
export const getPeriodeList = makeGetPeriodeList(models)

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
export { getStats } from './getStats'
export const getFailedNotificationsForRetry = makeGetFailedNotificationsForRetry(models)
export const getFailedNotificationDetails = makeGetFailedNotificationDetails(models)
export const getInfoForModificationRequested = makeGetInfoForModificationRequested(models)
export const getProjectIdForAdmissionKey = makeGetProjectIdForAdmissionKey(models)
export const getProjectDataForProjectPage = makeGetProjectDataForProjectPage(models)
export const getProjectIdsForPeriode = makeGetProjectIdsForPeriode(models)
export const getModificationRequestDataForResponseTemplate = makeGetModificationRequestDataForResponseTemplate(
  { models, getPeriode }
)
