import { Op } from 'sequelize'
import { v4 as uuid } from 'uuid'
import { DomainEvent } from '../../../core/domain'
import { logger, ResultAsync, wrapInfra } from '../../../core/utils'
import * as AuthorizationEvents from '../../../modules/authorization/events'
import * as CandidateNotificationEvents from '../../../modules/candidateNotification/events'
import { BaseEventStore, EventStoreHistoryFilters } from '../../../modules/eventStore'
import * as ModificationRequestEvents from '../../../modules/modificationRequest/events'
import * as AppelOffreEvents from '../../../modules/appelOffre/events'
import * as ProjectEvents from '../../../modules/project/events'
import * as UserEvents from '../../../modules/users/events'
import { InfraNotAvailableError } from '../../../modules/shared'

function isNotNullOrUndefined<T>(input: null | undefined | T): input is T {
  return input != null
}

interface EventProps {
  payload: any
  requestId?: string
  original?: {
    occurredAt: Date
    version: number
  }
}
interface HasEventConstructor {
  new (props: EventProps): DomainEvent
}

const EventClassByType: Record<string, HasEventConstructor> = {
  ...ModificationRequestEvents,
  ...CandidateNotificationEvents,
  ...ProjectEvents,
  ...AuthorizationEvents,
  ...AppelOffreEvents,
  ...UserEvents,
}

export class SequelizeEventStore extends BaseEventStore {
  private EventStoreModel
  constructor(models) {
    super()
    this.EventStoreModel = models.EventStore
  }

  protected persistEvents(events: DomainEvent[]): ResultAsync<null, InfraNotAvailableError> {
    return wrapInfra(this.EventStoreModel.bulkCreate(events.map(this.toPersistance)))
  }

  public loadHistory(
    filters?: EventStoreHistoryFilters
  ): ResultAsync<DomainEvent[], InfraNotAvailableError> {
    return wrapInfra(this.EventStoreModel.findAll(this.toQuery(filters)))
      .map((events: any[]) => events.map((item) => item.get()))
      .map((events: any[]) => {
        const payload = filters?.payload

        // Do this in memory for now
        // TODO: create proper sequelize query for payload search
        return payload
          ? events.filter((event) =>
              Object.entries(payload).every(([key, value]) => event.payload[key] === value)
            )
          : events
      })
      .map((events: any[]) => {
        return events.map(this.fromPersistance).filter(isNotNullOrUndefined)
      })
  }

  private toPersistance(event: DomainEvent) {
    return {
      id: uuid(),
      type: event.type,
      version: event.getVersion(),
      payload: event.payload,
      aggregateId:
        event.aggregateId &&
        (Array.isArray(event.aggregateId) ? event.aggregateId : [event.aggregateId]),
      requestId: event.requestId,
      occurredAt: event.occurredAt,
    }
  }

  private fromPersistance(eventRaw: any): DomainEvent | null {
    const EventClass = EventClassByType[eventRaw.type]

    if (!EventClass) {
      logger.error(
        `MEGA FAIL: SequelizeEventStore does not recognize this event type (see sequelizeEventStore.fromPersistance for missing type ${eventRaw.type}`
      )
      return null
    }

    return new EventClass({
      payload: eventRaw.payload,
      requestId: eventRaw.requestId?.toString(),
      original: {
        version: eventRaw.version,
        occurredAt: new Date(eventRaw.occurredAt),
      },
    })
  }

  private toQuery(filters?: EventStoreHistoryFilters) {
    const query: any = {}

    if (filters?.eventType) {
      query.type = filters.eventType
    }

    if (filters?.requestId) {
      query.requestId = filters.requestId
    }

    if (filters?.aggregateId) {
      query.aggregateId = { [Op.overlap]: [filters.aggregateId] }
    }

    return {
      where: query,
    }
  }
}
