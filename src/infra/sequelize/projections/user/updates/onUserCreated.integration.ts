import { UniqueEntityID } from '../../../../../core/domain'
import { UserCreated } from '../../../../../modules/users'
import { describeProjector } from '../../../__tests__/projections'
import models from '../../../models'
import { onUserCreated } from './onUserCreated'

const { User } = models

const userId = new UniqueEntityID().toString()

describeProjector(onUserCreated)
  .onEvent(
    new UserCreated({
      payload: {
        userId,
        role: 'porteur-projet',
        fullName: 'fullname',
        email: 'test@test.test',
      },
    })
  )
  .shouldCreate({
    model: User,
    id: userId,
    value: {
      fullName: 'fullname',
      email: 'test@test.test',
      role: 'porteur-projet',
      registeredOn: null,
    },
  })
