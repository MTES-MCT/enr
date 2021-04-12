import { Repository, UniqueEntityID } from '../../../core/domain'
import { errAsync, logger, ResultAsync } from '../../../core/utils'
import { User } from '../../../entities'
import { FileContents, FileObject, makeAndSaveFile } from '../../file'
import {
  AggregateHasBeenUpdatedSinceError,
  EntityNotFoundError,
  InfraNotAvailableError,
  UnauthorizedError,
} from '../../shared'
import { ModificationRequest } from '../ModificationRequest'

interface RequestConfirmationForAbandonDeps {
  modificationRequestRepo: Repository<ModificationRequest>
  fileRepo: Repository<FileObject>
}

interface RequestConfirmationForAbandonArgs {
  modificationRequestId: UniqueEntityID
  versionDate: Date
  responseFile: { contents: FileContents; filename: string }
  confirmationRequestedBy: User
}

export const makeRequestConfirmationForAbandon = (deps: RequestConfirmationForAbandonDeps) => (
  args: RequestConfirmationForAbandonArgs
): ResultAsync<
  null,
  | AggregateHasBeenUpdatedSinceError
  | InfraNotAvailableError
  | EntityNotFoundError
  | UnauthorizedError
> => {
  const { fileRepo, modificationRequestRepo } = deps
  const { modificationRequestId, versionDate, responseFile, confirmationRequestedBy } = args
  const { contents, filename } = responseFile

  if (!['admin', 'dgec'].includes(confirmationRequestedBy.role)) {
    return errAsync(new UnauthorizedError())
  }

  return modificationRequestRepo
    .load(modificationRequestId)
    .andThen(
      (
        modificationRequest
      ): ResultAsync<
        { modificationRequest: ModificationRequest; responseFileId: string },
        AggregateHasBeenUpdatedSinceError | InfraNotAvailableError
      > => {
        if (modificationRequest.lastUpdatedOn.getTime() !== versionDate.getTime()) {
          return errAsync(new AggregateHasBeenUpdatedSinceError())
        }

        return makeAndSaveFile({
          file: {
            designation: 'modification-request-response',
            forProject: modificationRequest.projectId,
            createdBy: new UniqueEntityID(confirmationRequestedBy.id),
            filename,
            contents,
          },
          fileRepo,
        })
          .map((responseFileId) => ({ modificationRequest, responseFileId }))
          .mapErr((e: Error) => {
            logger.error(e)
            return new InfraNotAvailableError()
          })
      }
    )
    .andThen(({ modificationRequest, responseFileId }) => {
      return modificationRequest
        .requestConfirmation(confirmationRequestedBy, responseFileId)
        .map(() => modificationRequest)
    })
    .andThen((modificationRequest) => {
      return modificationRequestRepo.save(modificationRequest)
    })
}
