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
import { makeRequestConfirmation } from './requestConfirmation'

describe('requestConfirmation use-case', () => {
  const fakeModificationRequest = {
    ...makeFakeModificationRequest(),
  }

  const modificationRequestRepo = fakeRepo(fakeModificationRequest as ModificationRequest)
  const fileRepo = {
    save: jest.fn((file: FileObject) => okAsync(null)),
    load: jest.fn(),
  }
  const fakeFileContents = Readable.from('test-content')
  const fakeFileName = 'myfilename.pdf'
  const fakeUser = UnwrapForTest(makeUser(makeFakeUser({ role: 'admin' })))

  const requestConfirmation = makeRequestConfirmation({
    modificationRequestRepo,
    fileRepo: fileRepo as Repository<FileObject>,
  })

  describe('when user is admin', () => {
    const fakeUser = UnwrapForTest(makeUser(makeFakeUser({ role: 'admin' })))

    describe('when a response file is attached', () => {
      beforeAll(async () => {
        const res = await requestConfirmation({
          modificationRequestId: fakeModificationRequest.id,
          versionDate: fakeModificationRequest.lastUpdatedOn,
          responseFile: { contents: fakeFileContents, filename: fakeFileName },
          confirmationRequestedBy: fakeUser,
        })

        if (res.isErr()) logger.error(res.error)
        expect(res.isOk()).toEqual(true)
      })

      it('should save the response file', () => {
        expect(fileRepo.save).toHaveBeenCalled()
        expect(fileRepo.save.mock.calls[0][0].contents).toEqual(fakeFileContents)
      })

      it('should call requestConfirmation on modificationRequest', () => {
        const responseFileId = fileRepo.save.mock.calls[0][0].id
        expect(fakeModificationRequest.requestConfirmation).toHaveBeenCalledTimes(1)
        expect(fakeModificationRequest.requestConfirmation).toHaveBeenCalledWith(
          fakeUser,
          responseFileId.toString()
        )
      })

      it('should save the modificationRequest', () => {
        expect(modificationRequestRepo.save).toHaveBeenCalled()
        expect(modificationRequestRepo.save.mock.calls[0][0]).toEqual(fakeModificationRequest)
      })
    })
  })

  describe('when user is not admin', () => {
    const fakeUser = UnwrapForTest(makeUser(makeFakeUser({ role: 'porteur-projet' })))

    it('should return UnauthorizedError', async () => {
      const res = await requestConfirmation({
        modificationRequestId: fakeModificationRequest.id,
        versionDate: fakeModificationRequest.lastUpdatedOn,
        responseFile: { contents: fakeFileContents, filename: fakeFileName },
        confirmationRequestedBy: fakeUser,
      })

      expect(res.isErr()).toEqual(true)
      if (res.isOk()) return

      expect(res.error).toBeInstanceOf(UnauthorizedError)
    })
  })

  describe('when versionDate is different than current versionDate', () => {
    it('should return AggregateHasBeenUpdatedSinceError', async () => {
      const res = await requestConfirmation({
        modificationRequestId: fakeModificationRequest.id,
        versionDate: new Date(1),
        responseFile: { contents: fakeFileContents, filename: fakeFileName },
        confirmationRequestedBy: fakeUser,
      })

      expect(res.isErr()).toEqual(true)
      if (res.isOk()) return
      expect(res.error).toBeInstanceOf(AggregateHasBeenUpdatedSinceError)
    })
  })
})
