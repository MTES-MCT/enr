import { ResultAsync } from '../../../core/utils'
import { PaginatedList, Pagination } from '../../../types'
import { InfraNotAvailableError } from '../../shared'

export type PendingCandidateInvitationDTO = {
  fullName: string
  email: string
  invitedOn: Date
}

export type GetPendingCandidateInvitations = (
  pagination: Pagination
) => ResultAsync<PaginatedList<PendingCandidateInvitationDTO>, InfraNotAvailableError>
