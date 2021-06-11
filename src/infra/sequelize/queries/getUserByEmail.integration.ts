import { UniqueEntityID } from '../../../core/domain'
import { FileNotFoundError } from '../../../modules/file'
import { EntityNotFoundError } from '../../../modules/shared'
import { resetDatabase } from '../helpers'
import models from '../models'
import { makeGetUserByEmail } from './getUserByEmail'

describe('Sequelize getUserByEmail', () => {
  const getUserByEmail = makeGetUserByEmail(models)
  const { User } = models

  const userId = new UniqueEntityID().toString()

  beforeAll(async () => {
    // Create the tables and remove all data
    await resetDatabase()

    await User.bulkCreate([
      {
        id: userId,
        fullName: 'John Doe',
        email: 'test@test.test',
        role: 'porteur-projet',
        registeredOn: new Date(123),
      },
    ])
  })

  describe('when the user exists', () => {
    it('should return the user', async () => {
      const res = await getUserByEmail('test@test.test')

      expect(res._unsafeUnwrap()).toMatchObject({
        id: userId,
        fullName: 'John Doe',
        email: 'test@test.test',
        role: 'porteur-projet',
        isRegistered: true,
      })
    })
  })

  describe('when the user does not exist', () => {
    it('should return null', async () => {
      const res = await getUserByEmail('nope')

      expect(res._unsafeUnwrap()).toBeNull()
    })
  })
})
