import { DrealUserInvited } from '../../../../../modules/authorization'
import { userDrealProjector } from '../userDreal.model'

export const onDrealUserInvited = userDrealProjector
  .on(DrealUserInvited)
  .create(({ payload: { region, userId } }) => ({
    userId,
    dreal: region,
  }))
