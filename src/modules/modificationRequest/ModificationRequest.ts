import { DomainEvent, UniqueEntityID } from '../../core/domain'
import { err, ok, Result } from '../../core/utils'
import { User } from '../../entities'
import { EventStoreAggregate } from '../eventStore'
import { EntityNotFoundError, IllegalInitialStateForAggregateError } from '../shared'
import { ModificationRequestVariants } from './dtos'
import {
  StatusPreventsAcceptingError,
  StatusPreventsConfirmationError,
  StatusPreventsRejectingError,
  TypePreventsConfirmationError,
} from './errors'
import {
  ModificationRequested,
  ModificationRequestAccepted,
  ModificationRequestRejected,
  ResponseTemplateDownloaded,
  ModificationRequestStatusUpdated,
  ConfirmationRequested,
} from './events'

export interface ModificationRequest extends EventStoreAggregate {
  accept(args: {
    acceptedBy: User
    responseFileId: string
    params?: ModificationRequestAcceptanceParams
  }): Result<null, StatusPreventsAcceptingError>
  reject(rejectedBy: User, responseFileId: string): Result<null, StatusPreventsRejectingError>
  requestConfirmation(
    confirmationRequestedBy: User,
    responseFileId: string
  ): Result<null, StatusPreventsConfirmationError | TypePreventsConfirmationError>
  updateStatus(args: { updatedBy: User; newStatus: ModificationRequestStatus })
  readonly projectId: UniqueEntityID
  readonly status: ModificationRequestStatus
  readonly type: ModifictionRequestType
}

export type ModificationRequestStatus =
  | 'envoyée'
  | 'acceptée'
  | 'rejetée'
  | 'annulée'
  | 'en attente de confirmation'
export type ModificationRequestAcceptanceParams =
  | { type: 'recours'; newNotificationDate: Date }
  | { type: 'delai'; delayInMonths: number }

export type ModifictionRequestType =
  | 'actionnaire'
  | 'fournisseur'
  | 'producteur'
  | 'puissance'
  | 'recours'
  | 'abandon'
  | 'delai'

interface ModificationRequestProps {
  lastUpdatedOn: Date
  projectId: UniqueEntityID
  hasError: boolean
  status: ModificationRequestStatus
  type: ModifictionRequestType
}

export const makeModificationRequest = (args: {
  modificationRequestId: UniqueEntityID
  history: DomainEvent[]
}): Result<ModificationRequest, EntityNotFoundError | IllegalInitialStateForAggregateError> => {
  const { history, modificationRequestId } = args

  if (!history?.length) {
    return err(new EntityNotFoundError())
  }

  const foundingEvent = _getFoundingEvent()

  if (!foundingEvent) {
    return err(new IllegalInitialStateForAggregateError())
  }

  const pendingEvents: DomainEvent[] = []
  const props: ModificationRequestProps = {
    lastUpdatedOn: history[0].occurredAt,
    hasError: false,
    projectId: new UniqueEntityID(foundingEvent.payload.projectId),
    status: 'envoyée',
    type: foundingEvent.payload.type as ModifictionRequestType,
  }

  for (const event of history) {
    _processEvent(event)

    if (props.hasError) {
      return err(new IllegalInitialStateForAggregateError())
    }
  }

  // public methods
  return ok({
    accept: function ({ acceptedBy, responseFileId, params }) {
      if (props.status !== 'envoyée') {
        return err(new StatusPreventsAcceptingError(props.status))
      }

      _publishEvent(
        new ModificationRequestAccepted({
          payload: {
            modificationRequestId: modificationRequestId.toString(),
            params,
            acceptedBy: acceptedBy.id,
            responseFileId,
          },
        })
      )

      return ok(null)
    },
    reject: function (rejectedBy, responseFileId) {
      if (props.status !== 'envoyée') {
        return err(new StatusPreventsRejectingError(props.status))
      }

      _publishEvent(
        new ModificationRequestRejected({
          payload: {
            modificationRequestId: modificationRequestId.toString(),
            rejectedBy: rejectedBy.id,
            responseFileId,
          },
        })
      )

      return ok(null)
    },
    requestConfirmation: function (confirmationRequestedBy, responseFileId) {
      if (props.status !== 'envoyée') {
        return err(new StatusPreventsConfirmationError(props.status))
      }

      if (props.type !== 'abandon') {
        return err(new TypePreventsConfirmationError(props.type))
      }

      _publishEvent(
        new ConfirmationRequested({
          payload: {
            modificationRequestId: modificationRequestId.toString(),
            confirmationRequestedBy: confirmationRequestedBy.id,
            responseFileId,
          },
        })
      )

      return ok(null)
    },
    updateStatus: function ({ updatedBy, newStatus }) {
      _publishEvent(
        new ModificationRequestStatusUpdated({
          payload: {
            modificationRequestId: modificationRequestId.toString(),
            updatedBy: updatedBy.id,
            newStatus,
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
    get projectId() {
      return props.projectId
    },
    get id() {
      return modificationRequestId
    },
    get status() {
      return props.status
    },
    get type() {
      return props.type
    },
  })

  function _publishEvent(event: DomainEvent) {
    pendingEvents.push(event)
    _processEvent(event)
  }

  function _processEvent(event: DomainEvent) {
    switch (event.type) {
      case ModificationRequested.type:
        props.status = 'envoyée'
        props.type = event.payload.type
        break
      case ModificationRequestAccepted.type:
        props.status = 'acceptée'
        break
      case ModificationRequestRejected.type:
        props.status = 'rejetée'
        break
      case ModificationRequestStatusUpdated.type:
        props.status = event.payload.newStatus
        break
      case ConfirmationRequested.type:
        props.status = 'en attente de confirmation'
        break
      default:
        // ignore other event types
        break
    }

    _updateLastUpdatedOn(event)
  }

  function _updateLastUpdatedOn(event: DomainEvent) {
    if (event.type !== ResponseTemplateDownloaded.type) {
      props.lastUpdatedOn = event.occurredAt
    }
  }

  function _isModificationRequestedEvent(event: DomainEvent): event is ModificationRequested {
    return event.type === ModificationRequested.type
  }

  function _getFoundingEvent(): ModificationRequested | undefined {
    return history.find(_isModificationRequestedEvent)
  }
}
