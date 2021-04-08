import _ from 'lodash'

import { DomainEvent, UniqueEntityID } from '../../core/domain'
import { err, ok, Result } from '../../core/utils'
import { User } from '../../entities'
import { EventStoreAggregate } from '../eventStore'
import { EntityNotFoundError, IllegalInitialStateForAggregateError } from '../shared'
import { AppelOffreCreated, AppelOffreUpdated, PeriodeCreated, PeriodeUpdated } from './events'

export interface AppelOffre extends EventStoreAggregate {
  update: (args: { data: any; updatedBy: User }) => Result<null, never>
}

interface AppelOffreProps {
  data: any
  periodes: { periodeId: string; data: any }[]
}

export const makeAppelOffre = (args: {
  events: DomainEvent[]
  id: UniqueEntityID
}): Result<AppelOffre, EntityNotFoundError | IllegalInitialStateForAggregateError> => {
  const { events, id } = args

  if (!events || !events.length) {
    return err(new EntityNotFoundError())
  }

  const props: AppelOffreProps = {
    data: {},
    periodes: [],
  }

  const pendingEvents: DomainEvent[] = []

  let lastUpdatedOn = new Date(0)
  let _isError = false

  for (const event of events) {
    _processEvent(event)

    if (_isError) {
      return err(new IllegalInitialStateForAggregateError())
    }
  }

  return ok({
    update({ data, updatedBy }) {
      const delta = _.omitBy(data, (value, key) => props.data[key] === value)

      if (Object.keys(delta).length) {
        _publishEvent(
          new AppelOffreUpdated({
            payload: {
              appelOffreId: id.toString(),
              delta,
              updatedBy: updatedBy.id,
            },
          })
        )
      }

      return ok(null)
    },
    get pendingEvents() {
      return pendingEvents
    },
    get id() {
      return id
    },
    get lastUpdatedOn() {
      return lastUpdatedOn
    },
  })

  function _publishEvent(event: DomainEvent) {
    pendingEvents.push(event)
    _processEvent(event)
  }

  function _processEvent(event: DomainEvent) {
    let existingPeriode
    switch (event.type) {
      case AppelOffreCreated.type:
        props.data = event.payload.data
        break
      case AppelOffreUpdated.type:
        props.data = { ...props.data, ...event.payload.delta }
        break
      case PeriodeCreated.type:
        props.periodes = [
          ...props.periodes,
          { periodeId: event.payload.periodeId, data: event.payload.data },
        ]
        break
      case PeriodeUpdated.type:
        existingPeriode = props.periodes.find(
          (periode) => periode.periodeId === event.payload.periodeId
        )
        if (!existingPeriode) {
          _isError = true
          break
        }
        existingPeriode.data = { ...existingPeriode.data, ...event.payload.delta }
        break
      default:
        // ignore other event types
        break
    }

    lastUpdatedOn = event.occurredAt
  }
}
