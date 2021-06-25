import { UniqueEntityID } from '../../../../../core/domain'
import { describeProjector } from '../../../__tests__/projections'
import models from '../../../models'
import { onDrealUserInvited } from './onDrealUserInvited'
import { DrealUserInvited } from '../../../../../modules/authorization'

const { UserDreal } = models

const userId = new UniqueEntityID().toString()

describeProjector(onDrealUserInvited)
  .onEvent(
    new DrealUserInvited({
      payload: {
        userId,
        region: 'Bretagne',
        invitedBy: '',
      },
    })
  )
  .shouldCreate({
    model: UserDreal,
    id: '1', // this field is set to autoincrement, so the first logical id is 1
    value: {
      userId,
      dreal: 'Bretagne',
    },
  })
