import { DomainEvent, UniqueEntityID } from '../../../core/domain'
import { okAsync } from '../../../core/utils'
import { InfraNotAvailableError } from '../../shared'
import { ModificationReceived } from '../../modificationRequest/events'
import { handleModificationReceived } from '.'
import { ProjectGFDueDateSet } from '..'

describe('handleModificationReceived', () => {
  const projectId = new UniqueEntityID()
  const modificationRequestId = new UniqueEntityID()

  // @ts-ignore
  Date.now = jest.fn(() => new Date('2020-01-01T00:00:00.000Z'))

  const eventBus = {
    publish: jest.fn((event: DomainEvent) => okAsync<null, InfraNotAvailableError>(null)),
    subscribe: jest.fn(),
  }

  const fakePayload = {
    modificationRequestId: modificationRequestId.toString(),
    type: 'actionnaire',
    projectId: projectId.toString(),
    requestedBy: 'user1',
    actionnaire: 'actionnaire1',
  }

  beforeAll(async () => {
    await handleModificationReceived({
      eventBus,
    })(
      new ModificationReceived({
        payload: fakePayload,
      })
    )
  })

  it('should emit a ProjectGFDueDateSet event', () => {
    const event = eventBus.publish.mock.calls
      .map((call) => call[0])
      .filter((event): event is ProjectGFDueDateSet => event.type === ProjectGFDueDateSet.type)
      .pop()

    expect(event).toBeDefined()
    expect(event.payload.projectId).toEqual(projectId.toString())

    const oneMonthLaterTimestamp = new Date('2020-02-01T00:00:00.000Z').getTime()
    expect(event.payload.garantiesFinancieresDueOn).toEqual(oneMonthLaterTimestamp)
  })
})
