import moment from 'moment'
import { ProjectGFDueDateSet } from '..'
import { EventBus } from '../../eventStore'
import { ModificationReceived } from '../../modificationRequest'

export const handleModificationReceived = (deps: { eventBus: EventBus }) => async (
  event: ModificationReceived
) => {
  const { eventBus } = deps
  const { projectId } = event.payload
  const { requestId } = event

  eventBus.publish(
    new ProjectGFDueDateSet({
      payload: {
        projectId: projectId.toString(),
        garantiesFinancieresDueOn: moment(Date.now()).add(1, 'months').toDate().getTime(),
      },
      requestId,
    })
  )
}
