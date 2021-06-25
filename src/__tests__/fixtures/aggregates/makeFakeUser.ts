import { DomainEvent, UniqueEntityID } from '../../../core/domain'
import { ok } from '../../../core/utils'

export const makeFakeUser = () => ({
  registerFirstLogin: jest.fn(() => ok<null, never>(null)),
  lastUpdatedOn: new Date(0),
  pendingEvents: [] as DomainEvent[],
  id: new UniqueEntityID(),
})
