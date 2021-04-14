import { Repository, UniqueEntityID } from '../../../core/domain'
import { combineWithAllErrors, errAsync, ResultAsync } from '../../../core/utils'
import { User } from '../../../entities'
import { EventBus } from '../../eventStore'
import { EntityNotFoundError, InfraNotAvailableError, UnauthorizedError } from '../../shared'
import { AppelOffre } from '../AppelOffre'
import { MissingAppelOffreIdError } from '../errors'
import { AppelOffreCreated } from '../events'
import { GetAppelOffreList } from '../queries'

interface ImportAppelOffreDataDeps {
  appelOffreRepo: Repository<AppelOffre>
  eventBus: EventBus
  getAppelOffreList: GetAppelOffreList
}

interface ImportAppelOffreDataArgs {
  dataLines: any
  importedBy: User
}

export const makeImportAppelOffreData = (deps: ImportAppelOffreDataDeps) => ({
  dataLines,
  importedBy,
}: ImportAppelOffreDataArgs): ResultAsync<
  null,
  (InfraNotAvailableError | UnauthorizedError | MissingAppelOffreIdError)[]
> => {
  return deps
    .getAppelOffreList()
    .mapErr((e): (InfraNotAvailableError | UnauthorizedError | MissingAppelOffreIdError)[] => [e])
    .andThen((appelOffreList) => {
      const removals = appelOffreList
        .filter(
          ({ appelOffreId }) =>
            !dataLines.find((dataLine) => dataLine.appelOffreId === appelOffreId)
        )
        .map(({ appelOffreId }) => {
          return deps.appelOffreRepo
            .load(new UniqueEntityID(appelOffreId))
            .andThen((appelOffre) =>
              appelOffre.remove({ removedBy: importedBy }).map(() => appelOffre)
            )
            .andThen((appelOffre) => deps.appelOffreRepo.save(appelOffre))
        })

      const updates: ResultAsync<
        null,
        InfraNotAvailableError | UnauthorizedError | MissingAppelOffreIdError
      >[] = dataLines.map((dataLine, index) => {
        const { appelOffreId, ...data } = dataLine

        if (!appelOffreId) {
          return errAsync(new MissingAppelOffreIdError(index + 1))
        }

        return deps.appelOffreRepo
          .load(new UniqueEntityID(appelOffreId))
          .andThen((appelOffre) =>
            appelOffre.update({ data, updatedBy: importedBy }).map(() => appelOffre)
          )
          .andThen((appelOffre) => deps.appelOffreRepo.save(appelOffre))
          .orElse((e) => {
            if (e instanceof EntityNotFoundError) {
              return deps.eventBus.publish(
                new AppelOffreCreated({
                  payload: {
                    appelOffreId,
                    data,
                    createdBy: importedBy.id,
                  },
                })
              )
            }

            return errAsync(e)
          })
      })

      return combineWithAllErrors([...removals, ...updates]).map(() => null)
    })
}
