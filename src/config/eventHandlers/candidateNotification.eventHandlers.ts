import {
  handleCandidateNotifiedForPeriode,
  handleProjectCertificateGeneratedOrFailed,
} from '../../modules/candidateNotification/eventHandlers'
import { CandidateNotifiedForPeriode } from '../../modules/candidateNotification/events'
import {
  ProjectCertificateGenerated,
  ProjectCertificateGenerationFailed,
} from '../../modules/project/events'
import { sendNotification } from '../emails.config'
import { eventStore } from '../eventStore.config'
import { getUserByEmail } from '../queries.config'
import { candidateNotificationRepo, oldAppelOffreRepo } from '../repos.config'
import { createUser } from '../useCases.config'

eventStore.subscribe(
  CandidateNotifiedForPeriode.type,
  handleCandidateNotifiedForPeriode({
    sendNotification,
    createUser,
    getUserByEmail,
    getPeriodeTitle: oldAppelOffreRepo.getPeriodeTitle,
  })
)

const projectCertficateHandler = handleProjectCertificateGeneratedOrFailed({
  candidateNotificationRepo,
})
eventStore.subscribe(ProjectCertificateGenerated.type, projectCertficateHandler)
eventStore.subscribe(ProjectCertificateGenerationFailed.type, projectCertficateHandler)

console.log('Candidate Notification Event Handlers Initialized')
export const candidateNotificationHandlersOk = true
