import { handlePeriodeNotified } from '../../modules/project/eventHandlers'
import { PeriodeNotified } from '../../modules/project/events'
import { eventStore } from '../eventStore.config'
import { getUnnotifiedProjectsForPeriode } from '../queries.config'
import { projectRepo } from '../repos.config'
import { generateCertificate } from '../useCases.config'

eventStore.subscribe(
  PeriodeNotified.type,
  handlePeriodeNotified({
    projectRepo,
    generateCertificate,
    getUnnotifiedProjectsForPeriode,
  })
)

console.log('Project Event Handlers Initialized')
export const projectHandlersOk = true
