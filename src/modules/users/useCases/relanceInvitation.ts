import { ResultAsync } from '../../../core/utils'
import { User } from '../../../entities'
import { EventBus } from '../../eventStore'
import { InfraNotAvailableError, UnauthorizedError } from '../../shared'
import { InvitationRelanceSent } from '../events'

interface RelanceInvitationDeps {
  resendInvitationEmail: (email: string) => ResultAsync<null, InfraNotAvailableError>
  eventBus: EventBus
}

interface RelanceInvitationArgs {
  email: string
  relanceBy: User
}

export const makeRelanceInvitation = (deps: RelanceInvitationDeps) => (
  args: RelanceInvitationArgs
): ResultAsync<null, UnauthorizedError | InfraNotAvailableError> => {
  const { resendInvitationEmail, eventBus } = deps
  const { email, relanceBy } = args

  return resendInvitationEmail(email).andThen(() =>
    eventBus.publish(
      new InvitationRelanceSent({
        payload: { email, relanceBy: relanceBy.id },
      })
    )
  )
}
