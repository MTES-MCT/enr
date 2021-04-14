import _ from 'lodash'

import { DomainEvent, UniqueEntityID } from '../../core/domain'
import { err, ok, Result } from '../../core/utils'
import { User } from '../../entities'
import { EventStoreAggregate } from '../eventStore'
import {
  EntityNotFoundError,
  IllegalInitialStateForAggregateError,
  UnauthorizedError,
} from '../shared'
import { AppelOffreCreated, AppelOffreUpdated, PeriodeCreated, PeriodeUpdated } from './events'
import { AppelOffreRemoved } from './events/AppelOffreRemoved'

export interface AppelOffre extends EventStoreAggregate {
  update: (args: { data: any; updatedBy: User }) => Result<null, UnauthorizedError>
  updatePeriode: (args: {
    periodeId: string
    data: any
    updatedBy: User
  }) => Result<null, UnauthorizedError>
  remove: ({ removedBy: User }) => Result<null, never>
}

interface AppelOffreProps {
  data: any
  periodes: { periodeId: string; data: any }[]
  removed: boolean
}

export const makeAppelOffre = (args: {
  events: DomainEvent[]
  id: UniqueEntityID
}): Result<AppelOffre, EntityNotFoundError | IllegalInitialStateForAggregateError> => {
  const { events, id } = args

  if (!events?.length) {
    return err(new EntityNotFoundError())
  }

  const props: AppelOffreProps = {
    data: {},
    periodes: [],
    removed: false,
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

  if (props.removed) {
    return err(new EntityNotFoundError())
  }

  return ok({
    update({ data, updatedBy }) {
      if (updatedBy.role !== 'admin') {
        return err(new UnauthorizedError())
      }

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
    remove({ removedBy }) {
      _publishEvent(
        new AppelOffreRemoved({
          payload: {
            appelOffreId: id.toString(),
            removedBy: removedBy.id,
          },
        })
      )

      return ok(null)
    },
    updatePeriode({ periodeId, data, updatedBy }) {
      if (updatedBy.role !== 'admin') {
        return err(new UnauthorizedError())
      }

      const periode = props.periodes.find((periode) => periode.periodeId === periodeId)

      if (!periode) {
        _publishEvent(
          new PeriodeCreated({
            payload: {
              appelOffreId: id.toString(),
              periodeId,
              data,
              createdBy: updatedBy.id,
            },
          })
        )
      } else {
        const delta = _.omitBy(data, (value, key) => periode.data[key] === value)
        if (Object.keys(delta).length) {
          _publishEvent(
            new PeriodeUpdated({
              payload: {
                appelOffreId: id.toString(),
                periodeId,
                delta,
                updatedBy: updatedBy.id,
              },
            })
          )
        }
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
    const { delta, data, periodeId } = event.payload
    switch (event.type) {
      case AppelOffreCreated.type:
        props.data = data
        props.removed = false
        break
      case AppelOffreUpdated.type:
        props.data = { ...props.data, ...delta }
        break
      case PeriodeCreated.type:
        props.periodes = [...props.periodes, { periodeId, data }]
        break
      case AppelOffreRemoved.type:
        props.removed = true
        break
      case PeriodeUpdated.type:
        existingPeriode = props.periodes.find((periode) => periode.periodeId === periodeId)
        if (!existingPeriode) {
          _isError = true
          break
        }
        existingPeriode.data = { ...existingPeriode.data, ...delta }
        break
      default:
        // ignore other event types
        break
    }

    lastUpdatedOn = event.occurredAt
  }
}
