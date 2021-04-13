import { DomainEvent, UniqueEntityID } from '../../../core/domain'
import { ok } from '../../../core/utils'
import { ProjectAppelOffre, User } from '../../../entities'
import { ProjectDataForCertificate } from '../../../modules/project/dtos'
import {
  EliminatedProjectCannotBeAbandonnedError,
  IllegalProjectDataError,
  ProjectAlreadyNotifiedError,
  ProjectCannotBeUpdatedIfUnnotifiedError,
} from '../../../modules/project/errors'
import { ProjectDataCorrectedPayload } from '../../../modules/project/events'
import { ProjectDataProps } from '../../../modules/project/Project'

export const makeFakeProject = (data: Partial<ProjectDataProps> = {}) => ({
  notify: jest.fn((notifiedOn: number) =>
    ok<null, IllegalProjectDataError | ProjectAlreadyNotifiedError>(null)
  ),
  abandon: jest.fn((user: User) => ok<null, EliminatedProjectCannotBeAbandonnedError>(null)),
  correctData: jest.fn((user: User, data: ProjectDataCorrectedPayload['correctedData']) =>
    ok<null, ProjectCannotBeUpdatedIfUnnotifiedError | IllegalProjectDataError>(null)
  ),
  setNotificationDate: jest.fn((user: User, notifiedOn: number) =>
    ok<null, ProjectCannotBeUpdatedIfUnnotifiedError | IllegalProjectDataError>(null)
  ),
  moveCompletionDueDate: jest.fn((user: User, delayInMonths: number) =>
    ok<null, ProjectCannotBeUpdatedIfUnnotifiedError | IllegalProjectDataError>(null)
  ),
  updateCertificate: jest.fn((user: User, certificateFileId: string) =>
    ok<null, ProjectCannotBeUpdatedIfUnnotifiedError>(null)
  ),
  grantClasse: jest.fn((user: User) => ok<null, never>(null)),
  addGeneratedCertificate: jest.fn(
    (args: { projectVersionDate: Date; certificateFileId: string }) => ok<null, never>(null)
  ),
  certificateData: ok({ template: 'v1', data: {} as ProjectDataForCertificate }),
  certificateFilename: '',
  shouldCertificateBeGenerated: true,
  pendingEvents: [] as DomainEvent[],
  appelOffre: {} as ProjectAppelOffre,
  isClasse: true,
  lastUpdatedOn: new Date(0),
  lastCertificateUpdate: undefined,
  data,
  id: new UniqueEntityID('project1'),
})
