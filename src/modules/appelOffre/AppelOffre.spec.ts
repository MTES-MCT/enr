import { UniqueEntityID } from '../../core/domain'
import { makeUser } from '../../entities'
import { UnwrapForTest } from '../../types'
import makeFakeUser from '../../__tests__/fixtures/user'
import { UnauthorizedError } from '../shared'
import { makeAppelOffre } from './AppelOffre'
import {
  AppelOffreCreated,
  AppelOffreRemoved,
  AppelOffreUpdated,
  PeriodeCreated,
  PeriodeUpdated,
} from './events'

describe('AppelOffre', () => {
  describe('update()', () => {
    const appelOffreId = new UniqueEntityID()

    describe('when user is admin', () => {
      const fakeUser = UnwrapForTest(makeUser(makeFakeUser({ role: 'admin' })))

      const appelOffre = makeAppelOffre({
        id: appelOffreId,
        events: [
          new AppelOffreCreated({
            payload: {
              appelOffreId: appelOffreId.toString(),
              createdBy: '',
              data: {
                param1: 'value1',
                param2: 'value2',
              },
            },
          }),
        ],
      })._unsafeUnwrap()

      it('should trigger AppelOffreUpdated with a computed delta', () => {
        appelOffre
          .update({
            data: {
              param1: 'value1',
              param2: 'newvalue2',
              param3: 'value3',
            },
            updatedBy: fakeUser,
          })
          ._unsafeUnwrap()

        expect(appelOffre.pendingEvents).toHaveLength(1)
        const event = appelOffre.pendingEvents[0]
        expect(event).toBeInstanceOf(AppelOffreUpdated)
        expect((event as AppelOffreUpdated).payload).toMatchObject({
          appelOffreId: appelOffreId.toString(),
          updatedBy: fakeUser.id,
          delta: {
            param2: 'newvalue2',
            param3: 'value3',
          },
        })
      })
    })

    describe('when user is not admin', () => {
      const fakeUser = UnwrapForTest(makeUser(makeFakeUser({ role: 'porteur-projet' })))

      const appelOffre = makeAppelOffre({
        id: appelOffreId,
        events: [
          new AppelOffreCreated({
            payload: {
              appelOffreId: appelOffreId.toString(),
              createdBy: '',
              data: {
                param1: 'value1',
                param2: 'value2',
              },
            },
          }),
        ],
      })._unsafeUnwrap()

      it('should return an UnauthorizedError', () => {
        const res = appelOffre.update({
          data: {
            param1: 'value1',
            param2: 'newvalue2',
            param3: 'value3',
          },
          updatedBy: fakeUser,
        })

        expect(res.isErr()).toBe(true)
        expect(res._unsafeUnwrapErr()).toBeInstanceOf(UnauthorizedError)
      })
    })
  })

  describe('remove()', () => {
    const appelOffreId = new UniqueEntityID()

    describe('when appel offre has not been removed yet', () => {
      const fakeUser = UnwrapForTest(makeUser(makeFakeUser({ role: 'admin' })))

      const appelOffre = makeAppelOffre({
        id: appelOffreId,
        events: [
          new AppelOffreCreated({
            payload: {
              appelOffreId: appelOffreId.toString(),
              createdBy: '',
              data: {},
            },
          }),
        ],
      })._unsafeUnwrap()

      it('should trigger AppelOffreRemoved', () => {
        appelOffre
          .remove({
            removedBy: fakeUser,
          })
          ._unsafeUnwrap()

        expect(appelOffre.pendingEvents).toHaveLength(1)
        const event = appelOffre.pendingEvents[0]
        expect(event).toBeInstanceOf(AppelOffreRemoved)
        expect((event as AppelOffreRemoved).payload).toMatchObject({
          appelOffreId: appelOffreId.toString(),
          removedBy: fakeUser.id,
        })
      })
    })
  })

  describe('updatePeriode()', () => {
    const appelOffreId = new UniqueEntityID()
    const periodeId = new UniqueEntityID().toString()

    describe('when user is admin', () => {
      const fakeUser = UnwrapForTest(makeUser(makeFakeUser({ role: 'admin' })))

      describe('when periode is new', () => {
        const appelOffre = makeAppelOffre({
          id: appelOffreId,
          events: [
            new AppelOffreCreated({
              payload: {
                appelOffreId: appelOffreId.toString(),
                createdBy: '',
                data: {
                  param1: 'value1',
                  param2: 'value2',
                },
              },
            }),
          ],
        })._unsafeUnwrap()

        it('should trigger PeriodeCreated', () => {
          appelOffre
            .updatePeriode({
              periodeId,
              data: {
                param1: 'value1',
              },
              updatedBy: fakeUser,
            })
            ._unsafeUnwrap()

          expect(appelOffre.pendingEvents).toHaveLength(1)
          const event = appelOffre.pendingEvents[0]
          expect(event).toBeInstanceOf(PeriodeCreated)
          expect((event as PeriodeCreated).payload).toMatchObject({
            appelOffreId: appelOffreId.toString(),
            periodeId,
            createdBy: fakeUser.id,
            data: {
              param1: 'value1',
            },
          })
        })
      })

      describe('when the periode existed', () => {
        const appelOffre = makeAppelOffre({
          id: appelOffreId,
          events: [
            new AppelOffreCreated({
              payload: {
                appelOffreId: appelOffreId.toString(),
                createdBy: '',
                data: {},
              },
            }),
            new PeriodeCreated({
              payload: {
                appelOffreId: appelOffreId.toString(),
                periodeId,
                createdBy: '',
                data: {
                  param1: 'value1',
                  param2: 'value2',
                },
              },
            }),
          ],
        })._unsafeUnwrap()

        it('should trigger PeriodeUpdated with a computed delta', () => {
          appelOffre
            .updatePeriode({
              periodeId,
              data: {
                param1: 'value1',
                param2: 'newvalue2',
                param3: 'value3',
              },
              updatedBy: fakeUser,
            })
            ._unsafeUnwrap()

          expect(appelOffre.pendingEvents).toHaveLength(1)
          const event = appelOffre.pendingEvents[0]
          expect(event).toBeInstanceOf(PeriodeUpdated)
          expect((event as PeriodeUpdated).payload).toMatchObject({
            appelOffreId: appelOffreId.toString(),
            periodeId,
            updatedBy: fakeUser.id,
            delta: {
              param2: 'newvalue2',
              param3: 'value3',
            },
          })
        })
      })
    })

    describe('when user is not admin', () => {
      const fakeUser = UnwrapForTest(makeUser(makeFakeUser({ role: 'porteur-projet' })))

      const appelOffre = makeAppelOffre({
        id: appelOffreId,
        events: [
          new AppelOffreCreated({
            payload: {
              appelOffreId: appelOffreId.toString(),
              createdBy: '',
              data: {
                param1: 'value1',
                param2: 'value2',
              },
            },
          }),
        ],
      })._unsafeUnwrap()

      it('should return an UnauthorizedError', () => {
        const res = appelOffre.updatePeriode({
          periodeId: '1',
          data: {
            param1: 'value1',
            param2: 'newvalue2',
            param3: 'value3',
          },
          updatedBy: fakeUser,
        })

        expect(res.isErr()).toBe(true)
        expect(res._unsafeUnwrapErr()).toBeInstanceOf(UnauthorizedError)
      })
    })
  })
})
