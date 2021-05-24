import { EventBus } from '../../../../../modules/eventStore'
import {
  ProjectCertificateGenerated,
  ProjectCertificateRegenerated,
  ProjectCertificateUpdated,
  ProjectClasseGranted,
  ProjectDataCorrected,
  ProjectDCRDueDateSet,
  ProjectGFDueDateSet,
  ProjectNotificationDateSet,
  ProjectNotified,
  ProjectDCRSubmitted,
  ProjectCompletionDueDateSet,
  NumeroGestionnaireSubmitted,
  ProjectAbandoned,
  ProjectPuissanceUpdated,
  ProjectActionnaireUpdated,
  ProjectProducteurUpdated,
  ProjectGFInvalidated,
} from '../../../../../modules/project/events'
import { onProjectCertificate } from './onProjectCertificate'
import { onProjectDataCorrected } from './onProjectDataCorrected'
import { onProjectDCRDueDateSet } from './onProjectDCRDueDateSet'
import { onProjectGFDueDateSet } from './onProjectGFDueDateSet'
import { onProjectGFInvalidated } from './onProjectGFInvalidated'
import { onProjectCompletionDueDateSet } from './onProjectCompletionDueDateSet'
import { onProjectNotificationDateSet } from './onProjectNotificationDateSet'
import { onProjectClasseGranted } from './onProjectClasseGranted'
import { onNumeroGestionnaireSubmitted } from './onNumeroGestionnaireSubmitted'
import { onProjectDCRSubmitted } from './onProjectDCRSubmitted'
import { onProjectAbandoned } from './onProjectAbandoned'
import { onProjectPuissanceUpdated } from './onProjectPuissanceUpdated'
import { onProjectActionnaireUpdated } from './onProjectActionnaireUpdated'
import { onProjectProducteurUpdated } from './onProjectProducteurUpdated'
import { logger } from '../../../../../core/utils'

export const initProjectProjections = (eventBus: EventBus, models) => {
  eventBus.subscribe(ProjectDataCorrected.type, onProjectDataCorrected(models))
  eventBus.subscribe(ProjectDCRDueDateSet.type, onProjectDCRDueDateSet(models))
  eventBus.subscribe(ProjectGFDueDateSet.type, onProjectGFDueDateSet(models))
  eventBus.subscribe(ProjectGFInvalidated.type, onProjectGFInvalidated(models))
  eventBus.subscribe(ProjectCompletionDueDateSet.type, onProjectCompletionDueDateSet(models))
  eventBus.subscribe(ProjectNotified.type, onProjectNotificationDateSet(models))
  eventBus.subscribe(ProjectNotificationDateSet.type, onProjectNotificationDateSet(models))
  eventBus.subscribe(ProjectCertificateGenerated.type, onProjectCertificate(models))
  eventBus.subscribe(ProjectCertificateRegenerated.type, onProjectCertificate(models))
  eventBus.subscribe(ProjectCertificateUpdated.type, onProjectCertificate(models))

  eventBus.subscribe(ProjectClasseGranted.type, onProjectClasseGranted(models))

  eventBus.subscribe(NumeroGestionnaireSubmitted.type, onNumeroGestionnaireSubmitted(models))

  eventBus.subscribe(ProjectDCRSubmitted.type, onProjectDCRSubmitted(models))
  eventBus.subscribe(ProjectAbandoned.type, onProjectAbandoned(models))
  eventBus.subscribe(ProjectPuissanceUpdated.type, onProjectPuissanceUpdated(models))
  eventBus.subscribe(ProjectActionnaireUpdated.type, onProjectActionnaireUpdated(models))
  eventBus.subscribe(ProjectProducteurUpdated.type, onProjectProducteurUpdated(models))

  logger.info('Initialized Project projections')
}
