import { Readable } from 'stream'
import { Repository } from '../../../core/domain'
import { logger, okAsync } from '../../../core/utils'
import { makeUser } from '../../../entities'
import { UnwrapForTest } from '../../../types'
import { fakeRepo, makeFakeModificationRequest } from '../../../__tests__/fixtures/aggregates'
import makeFakeUser from '../../../__tests__/fixtures/user'
import { FileObject } from '../../file'
import { AggregateHasBeenUpdatedSinceError, UnauthorizedError } from '../../shared'
import { ModificationRequest } from '../ModificationRequest'
import { makeConfirmRequest } from './confirmRequest'

describe('confirmRequest use-case', () => {
  describe('when user is a porteur-projet which has rights on this project', () => {
    const fakeModificationRequest = {
      ...makeFakeModificationRequest(),
      lastUpdatedOn: new Date(1234),
    }

    const modificationRequestRepo = fakeRepo(fakeModificationRequest as ModificationRequest)

    const shouldUserAccessProject = jest.fn(async () => true)

    const confirmRequest = makeConfirmRequest({
      modificationRequestRepo,
      shouldUserAccessProject,
    })

    const fakeUser = UnwrapForTest(makeUser(makeFakeUser({ role: 'porteur-projet' })))

    it('should call confirm on modificationRequest', async () => {
      const res = await confirmRequest({
        modificationRequestId: fakeModificationRequest.id,
        versionDate: new Date(1234),
        confirmedBy: fakeUser,
      })

      expect(res.isOk()).toBe(true)

      expect(fakeModificationRequest.confirm).toHaveBeenCalledTimes(1)
      expect(fakeModificationRequest.confirm).toHaveBeenCalledWith(fakeUser)
    })
  })

  describe('when user is not porteur-projet', () => {
    const fakeModificationRequest = {
      ...makeFakeModificationRequest(),
      lastUpdatedOn: new Date(1234),
    }

    const modificationRequestRepo = fakeRepo(fakeModificationRequest as ModificationRequest)

    const shouldUserAccessProject = jest.fn(async () => true)

    const confirmRequest = makeConfirmRequest({
      modificationRequestRepo,
      shouldUserAccessProject,
    })

    const fakeUser = UnwrapForTest(makeUser(makeFakeUser({ role: 'admin' })))

    it('should return UnauthorizedError', async () => {
      const res = await confirmRequest({
        modificationRequestId: fakeModificationRequest.id,
        versionDate: fakeModificationRequest.lastUpdatedOn,
        confirmedBy: fakeUser,
      })

      expect(res.isErr()).toEqual(true)
      if (res.isOk()) return

      expect(res.error).toBeInstanceOf(UnauthorizedError)
    })
  })

  describe('when user is porteur-projet that does not have rights on this project', () => {
    const fakeModificationRequest = {
      ...makeFakeModificationRequest(),
      lastUpdatedOn: new Date(1234),
    }

    const modificationRequestRepo = fakeRepo(fakeModificationRequest as ModificationRequest)

    const shouldUserAccessProject = jest.fn(async () => false) // <--

    const confirmRequest = makeConfirmRequest({
      modificationRequestRepo,
      shouldUserAccessProject,
    })

    const fakeUser = UnwrapForTest(makeUser(makeFakeUser({ role: 'porteur-projet' })))

    it('should return UnauthorizedError', async () => {
      const res = await confirmRequest({
        modificationRequestId: fakeModificationRequest.id,
        versionDate: fakeModificationRequest.lastUpdatedOn,
        confirmedBy: fakeUser,
      })

      expect(res.isErr()).toEqual(true)
      if (res.isOk()) return

      expect(res.error).toBeInstanceOf(UnauthorizedError)
    })
  })

  describe('when versionDate is different than current versionDate', () => {
    const fakeModificationRequest = {
      ...makeFakeModificationRequest(),
      lastUpdatedOn: new Date(1234),
    }

    const modificationRequestRepo = fakeRepo(fakeModificationRequest as ModificationRequest)

    const shouldUserAccessProject = jest.fn(async () => false) // <--

    const confirmRequest = makeConfirmRequest({
      modificationRequestRepo,
      shouldUserAccessProject,
    })

    const fakeUser = UnwrapForTest(makeUser(makeFakeUser({ role: 'porteur-projet' })))

    it('should return AggregateHasBeenUpdatedSinceError', async () => {
      const res = await confirmRequest({
        modificationRequestId: fakeModificationRequest.id,
        versionDate: new Date(1),
        confirmedBy: fakeUser,
      })

      expect(res.isErr()).toEqual(true)
      if (res.isOk()) return
      expect(res.error).toBeInstanceOf(AggregateHasBeenUpdatedSinceError)
    })
  })
})
