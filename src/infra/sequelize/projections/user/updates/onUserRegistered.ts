import { UserRegistered } from '../../../../../modules/users'
import { userProjector } from '../user.model'

export const onUserRegistered = userProjector.on(UserRegistered).update({
  where: ({ payload: { userId } }) => ({
    id: userId,
  }),
  delta: ({ payload: { fullName }, occurredAt }) => ({ registeredOn: occurredAt, fullName }),
})
