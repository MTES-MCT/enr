import { UserCreated } from '../../../../../modules/users'
import { userProjector } from '../user.model'

export const onUserCreated = userProjector
  .on(UserCreated)
  .create(({ payload: { userId, email, role, fullName } }) => ({
    id: userId,
    email,
    role,
    fullName,
  }))
