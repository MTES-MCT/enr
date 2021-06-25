import { UniqueEntityID } from '../../../../core/domain'
import makeFakeUser from '../../../../__tests__/fixtures/user'
import makeFakeProject from '../../../../__tests__/fixtures/project'
import { resetDatabase } from '../../helpers'
import { getPendingCandidateInvitations } from './getPendingCandidateInvitations'

import models from '../../models'
describe('getPendingCandidateInvitations()', () => {
  const { User, Project } = models

  const pendingCandidateId = new UniqueEntityID().toString()
  const pendingNonCandidateId = new UniqueEntityID().toString()

  describe('without an appelOffre or periodeId', () => {
    beforeAll(async () => {
      // Create the tables and remove all data
      await resetDatabase()

      await User.bulkCreate([
        makeFakeUser({
          id: pendingCandidateId,
          email: 'pending@test.test',
          fullName: 'pending user',
          registeredOn: null,
          createdAt: new Date(345),
        }),
        makeFakeUser({
          id: pendingNonCandidateId,
          email: 'pendingNotCandidate@test.test',
          fullName: 'pending non candidate',
          registeredOn: null,
        }),
        makeFakeUser({
          id: new UniqueEntityID().toString(),
          registeredOn: new Date(123),
        }),
      ])

      await Project.create(
        makeFakeProject({
          email: 'pending@test.test',
        })
      )
    })

    it('return a paginated list of users that are not yet registered and is the candidate of at least one project', async () => {
      const pendingInvitations = await getPendingCandidateInvitations({ pageSize: 10, page: 0 })

      expect(pendingInvitations._unsafeUnwrap().itemCount).toEqual(1)
      expect(pendingInvitations._unsafeUnwrap().pageCount).toEqual(1)
      expect(pendingInvitations._unsafeUnwrap().items[0]).toMatchObject({
        email: 'pending@test.test',
        fullName: 'pending user',
        invitedOn: new Date(345),
      })
    })
  })
})
