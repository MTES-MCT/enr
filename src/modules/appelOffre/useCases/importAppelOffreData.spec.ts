import { DomainEvent, Repository, UniqueEntityID } from '../../../core/domain'
import { errAsync, okAsync } from '../../../core/utils'
import { makeUser } from '../../../entities'
import { UnwrapForTest } from '../../../types'
import { makeFakeAppelOffre } from '../../../__tests__/fixtures/aggregates'
import makeFakeUser from '../../../__tests__/fixtures/user'
import { EntityNotFoundError, InfraNotAvailableError } from '../../shared'
import { AppelOffre } from '../AppelOffre'
import { AppelOffreDTO } from '../dtos'
import { MissingAppelOffreIdError } from '../errors'
import { AppelOffreCreated } from '../events'
import { makeImportAppelOffreData } from './importAppelOffreData'

describe('importAppelOffreData use-case', () => {
  const user = UnwrapForTest(makeUser(makeFakeUser({ role: 'admin' })))

  describe('when a data line represents a new appel offre', () => {
    const appelOffreRepo: Repository<AppelOffre> = {
      save: jest.fn(),
      load: jest.fn(() => errAsync(new EntityNotFoundError())),
    }

    const eventBus = {
      publish: jest.fn((event: DomainEvent) => okAsync<null, InfraNotAvailableError>(null)),
      subscribe: jest.fn(),
    }

    const getAppelOffreList = jest.fn(() => okAsync<AppelOffreDTO[], InfraNotAvailableError>([]))

    const importAppelOffreData = makeImportAppelOffreData({
      appelOffreRepo,
      eventBus,
      getAppelOffreList,
    })

    it('should publish AppelOffreCreated', async () => {
      const res = await importAppelOffreData({
        dataLines: [{ appelOffreId: 'appelOffreId', other: 'param' }],
        importedBy: user,
      })

      expect(res.isOk()).toBe(true)
      if (res.isErr()) return

      expect(eventBus.publish).toHaveBeenCalledTimes(1)
      const event = eventBus.publish.mock.calls[0][0]
      expect(event).toBeInstanceOf(AppelOffreCreated)
      expect(event.payload).toMatchObject({
        appelOffreId: 'appelOffreId',
        data: { other: 'param' },
        createdBy: user.id,
      })
    })
  })

  describe('when a data line represents an existing appel offre', () => {
    const fakeAppelOffre = makeFakeAppelOffre()

    const appelOffreRepo: Repository<AppelOffre> = {
      save: jest.fn(() => okAsync(null)),
      load: jest.fn(() => okAsync(fakeAppelOffre)),
    }

    const eventBus = {
      publish: jest.fn(),
      subscribe: jest.fn(),
    }

    const getAppelOffreList = jest.fn(() =>
      okAsync<AppelOffreDTO[], InfraNotAvailableError>([{ appelOffreId: 'appelOffreId' }])
    )

    const importAppelOffreData = makeImportAppelOffreData({
      appelOffreRepo,
      eventBus,
      getAppelOffreList,
    })

    it('should call update on the appelOffre and save it', async () => {
      const res = await importAppelOffreData({
        dataLines: [{ appelOffreId: 'appelOffreId', other: 'param' }],
        importedBy: user,
      })

      expect(res.isOk()).toBe(true)
      if (res.isErr()) return

      expect(appelOffreRepo.load).toHaveBeenCalledWith(new UniqueEntityID('appelOffreId'))

      expect(fakeAppelOffre.update).toHaveBeenCalledWith({
        data: { other: 'param' },
        updatedBy: user,
      })

      expect(appelOffreRepo.save).toHaveBeenCalledWith(fakeAppelOffre)
    })
  })

  describe('when an existing appel offre is no longer present in data lines', () => {
    const fakeAppelOffre = makeFakeAppelOffre()

    const appelOffreRepo: Repository<AppelOffre> = {
      save: jest.fn(() => okAsync(null)),
      load: jest.fn(() => okAsync(fakeAppelOffre)),
    }

    const eventBus = {
      publish: jest.fn(),
      subscribe: jest.fn(),
    }

    const getAppelOffreList = jest.fn(() =>
      okAsync<AppelOffreDTO[], InfraNotAvailableError>([{ appelOffreId: 'appelOffreId1' }])
    )

    const importAppelOffreData = makeImportAppelOffreData({
      appelOffreRepo,
      eventBus,
      getAppelOffreList,
    })

    it('should call remove on the appelOffre and save it', async () => {
      const res = await importAppelOffreData({
        dataLines: [],
        importedBy: user,
      })

      expect(res.isOk()).toBe(true)
      if (res.isErr()) return

      expect(appelOffreRepo.load).toHaveBeenCalledWith(new UniqueEntityID('appelOffreId1'))

      expect(fakeAppelOffre.remove).toHaveBeenCalledWith({
        removedBy: user,
      })

      expect(appelOffreRepo.save).toHaveBeenCalledWith(fakeAppelOffre)
    })
  })

  describe('when a data line is missing an appel offre id', () => {
    const appelOffreRepo: Repository<AppelOffre> = {
      save: jest.fn(),
      load: jest.fn(),
    }

    const eventBus = {
      publish: jest.fn(),
      subscribe: jest.fn(),
    }

    const getAppelOffreList = jest.fn(() => okAsync<AppelOffreDTO[], InfraNotAvailableError>([]))

    const importAppelOffreData = makeImportAppelOffreData({
      appelOffreRepo,
      eventBus,
      getAppelOffreList,
    })

    it('should return a AppelOffreDoesNotExistError', async () => {
      const res = await importAppelOffreData({
        dataLines: [{ other: 'param' }],
        importedBy: user,
      })

      expect(res._unsafeUnwrapErr()[0]).toBeInstanceOf(MissingAppelOffreIdError)
      expect(res._unsafeUnwrapErr()[0]).toMatchObject({
        lineNumber: 1,
      })
    })
  })
})
