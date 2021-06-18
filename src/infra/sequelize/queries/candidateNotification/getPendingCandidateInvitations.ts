import { okAsync, wrapInfra } from '../../../../core/utils'
import { GetPendingCandidateInvitations } from '../../../../modules/candidateNotification'
import { models } from '../../models'
import { paginate, makePaginatedList } from '../../../../helpers/paginate'
import { Pagination } from '../../../../types'
const { User, Project } = models

export const getPendingCandidateInvitations: GetPendingCandidateInvitations = (
  pagination: Pagination
) => {
  return wrapInfra(
    User.findAndCountAll({
      where: { registeredOn: null },
      include: [{ model: Project, as: 'candidateProjects', required: true }],
      ...paginate(pagination),
    })
  ).map(({ count, rows: pendingUsers }) =>
    makePaginatedList(
      pendingUsers.map(({ email, fullName, createdAt }) => ({
        email,
        fullName,
        invitedOn: createdAt,
      })),
      count,
      pagination
    )
  )
}
