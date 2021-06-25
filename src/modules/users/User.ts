import { DomainEvent, UniqueEntityID } from '../../core/domain'
import { err, ok, Result } from '../../core/utils'
import { EventStoreAggregate } from '../eventStore'
import { EntityNotFoundError } from '../shared'
import { UserRegistered } from './events'

export interface User extends EventStoreAggregate {
  registerFirstLogin(args: { fullName: string }): Result<null, never>
}

interface UserProps {
  isRegistered: boolean
  lastUpdatedOn: Date
}

export const makeUser = (args: {
  id: UniqueEntityID
  events: DomainEvent[]
}): Result<User, EntityNotFoundError> => {
  const { events, id } = args

  if (!events?.length) {
    return err(new EntityNotFoundError())
  }

  const pendingEvents: DomainEvent[] = []

  const props: UserProps = {
    isRegistered: false,
    lastUpdatedOn: events[0].occurredAt,
  }

  for (const event of events) {
    _processEvent(event)
  }

  function _processEvent(event: DomainEvent) {
    switch (event.type) {
      case UserRegistered.type:
        props.isRegistered = true
        break
      default:
        // ignore other event types
        break
    }

    _updateLastUpdatedOn(event)
  }

  function _updateLastUpdatedOn(event: DomainEvent) {
    props.lastUpdatedOn = event.occurredAt
  }

  function _publishEvent(event: DomainEvent) {
    pendingEvents.push(event)
    _processEvent(event)
  }

  return ok({
    registerFirstLogin: function ({ fullName }) {
      if (!props.isRegistered)
        _publishEvent(
          new UserRegistered({
            payload: {
              userId: id.toString(),
              fullName: fullName,
            },
          })
        )

      return ok(null)
    },
    get pendingEvents() {
      return pendingEvents
    },
    get lastUpdatedOn() {
      return props.lastUpdatedOn
    },
    get id() {
      return id
    },
  })
}
