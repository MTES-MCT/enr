import { EventBus } from '../../../../../modules/eventStore'
import {
  PeriodeCreated,
  PeriodeUpdated,
  AppelOffreUpdated,
  AppelOffreCreated,
  AppelOffreRemoved,
} from '../../../../../modules/appelOffre'
import { onPeriodeCreated } from './onPeriodeCreated'
import { onPeriodeUpdated } from './onPeriodeUpdated'
import { onAppelOffreUpdated } from './onAppelOffreUpdated'
import { onAppelOffreCreated } from './onAppelOffreCreated'
import { onAppelOffreRemoved } from './onAppelOffreRemoved'
import { logger } from '../../../../../core/utils'

export const initAppelOffreProjections = (eventBus: EventBus, models) => {
  eventBus.subscribe(PeriodeCreated.type, onPeriodeCreated(models))
  eventBus.subscribe(PeriodeUpdated.type, onPeriodeUpdated(models))
  eventBus.subscribe(AppelOffreUpdated.type, onAppelOffreUpdated(models))
  eventBus.subscribe(AppelOffreCreated.type, onAppelOffreCreated(models))
  eventBus.subscribe(AppelOffreRemoved.type, onAppelOffreRemoved(models))

  logger.info('Initialized AppelOffre projections')
}
