import { Repository, UniqueEntityID } from '../../../core/domain'
import { err, errAsync, logger, ok, Result, ResultAsync } from '../../../core/utils'
import { User } from '../../../entities'
import { FileContents, FileObject, makeAndSaveFile } from '../../file'
import {
  IllegalProjectDataError,
  ProjectCannotBeUpdatedIfUnnotifiedError,
} from '../../project/errors'
import { Project } from '../../project/Project'
import {
  AggregateHasBeenUpdatedSinceError,
  EntityNotFoundError,
  InfraNotAvailableError,
  UnauthorizedError,
} from '../../shared'
import { ModificationRequest, ModificationRequestAcceptanceParams } from '../ModificationRequest'

interface AcceptModificationRequestDeps {
  modificationRequestRepo: Repository<ModificationRequest>
  projectRepo: Repository<Project>
  fileRepo: Repository<FileObject>
}

interface AcceptModificationRequestArgs {
  modificationRequestId: UniqueEntityID
  acceptanceParams?: ModificationRequestAcceptanceParams
  versionDate: Date
  responseFile: { contents: FileContents; filename: string }
  submittedBy: User
}

export const makeAcceptModificationRequest = (deps: AcceptModificationRequestDeps) => (
  args: AcceptModificationRequestArgs
): ResultAsync<
  null,
  | AggregateHasBeenUpdatedSinceError
  | InfraNotAvailableError
  | EntityNotFoundError
  | UnauthorizedError
> => {
  const { fileRepo, modificationRequestRepo, projectRepo } = deps
  const { modificationRequestId, versionDate, responseFile, submittedBy, acceptanceParams } = args
  const { contents, filename } = responseFile

  if (!['admin', 'dgec'].includes(submittedBy.role)) {
    return errAsync(new UnauthorizedError())
  }

  return modificationRequestRepo
    .load(modificationRequestId)
    .andThen(
      (modificationRequest): Result<ModificationRequest, AggregateHasBeenUpdatedSinceError> => {
        if (modificationRequest.lastUpdatedOn.getTime() !== versionDate.getTime()) {
          return err(new AggregateHasBeenUpdatedSinceError())
        }

        return ok(modificationRequest)
      }
    )
    .andThen((modificationRequest) => {
      return projectRepo
        .load(modificationRequest.projectId)
        .map((project) => ({ project, modificationRequest }))
    })
    .andThen(({ project, modificationRequest }) => {
      return makeAndSaveFile({
        file: {
          designation: 'modification-request-response',
          forProject: modificationRequest.projectId,
          createdBy: new UniqueEntityID(submittedBy.id),
          filename,
          contents,
        },
        fileRepo,
      })
        .map((responseFileId) => ({ project, modificationRequest, responseFileId }))
        .mapErr((e: Error) => {
          logger.error(e)
          return new InfraNotAvailableError()
        })
    })
    .andThen(({ project, modificationRequest, responseFileId }) => {
      let action: Result<
        null,
        ProjectCannotBeUpdatedIfUnnotifiedError | IllegalProjectDataError
      > = ok(null)

      if (modificationRequest.type === 'recours' && acceptanceParams?.type === 'recours') {
        action = project
          .grantClasse(submittedBy)
          .andThen(() => project.updateCertificate(submittedBy, responseFileId))
          .andThen(() =>
            project.setNotificationDate(submittedBy, acceptanceParams.newNotificationDate.getTime())
          )
      } else if (modificationRequest.type === 'delai' && acceptanceParams?.type === 'delai') {
        action = project.moveCompletionDueDate(submittedBy, acceptanceParams.delayInMonths)
      } else if (modificationRequest.type === 'abandon') {
        action = project.abandon(submittedBy)
      }
      return action.map(() => ({ project, modificationRequest, responseFileId }))
    })
    .andThen(({ project, modificationRequest, responseFileId }) => {
      return modificationRequest
        .accept({ acceptedBy: submittedBy, params: acceptanceParams, responseFileId })
        .map(() => ({ project, modificationRequest }))
    })
    .andThen(({ project, modificationRequest }) => {
      return projectRepo.save(project).map(() => modificationRequest)
    })
    .andThen((modificationRequest) => {
      return modificationRequestRepo.save(modificationRequest)
    })
}
