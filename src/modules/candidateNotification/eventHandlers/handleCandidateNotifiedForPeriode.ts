import { logger, wrapInfra } from '../../../core/utils'
import routes from '../../../routes'
import { GetPeriodeTitle } from '../../appelOffre'
import { NotificationService } from '../../notification'
import { GetUserByEmail, makeCreateUser } from '../../users'
import { CandidateNotifiedForPeriode } from '../events/CandidateNotifiedForPeriode'

export const handleCandidateNotifiedForPeriode = (deps: {
  sendNotification: NotificationService['sendNotification']
  createUser: ReturnType<typeof makeCreateUser>
  getUserByEmail: GetUserByEmail
  getPeriodeTitle: GetPeriodeTitle
}) => async (event: CandidateNotifiedForPeriode) => {
  const { sendNotification, createUser, getPeriodeTitle, getUserByEmail } = deps
  const {
    payload: { periodeId, appelOffreId, candidateEmail, candidateName },
  } = event

  await getUserByEmail(candidateEmail)
    .andThen((userOrNull) => {
      if (userOrNull === null) {
        return createUser({
          role: 'porteur-projet',
          email: candidateEmail,
          fullName: candidateName,
        })
      }

      return _sendCandidateNotification()
    })
    .match(
      () => {},
      (e) => {
        logger.info(`Failed to notify candidate for periode ${appelOffreId} - ${periodeId}`)
        logger.error(e)
      }
    )

  function _sendCandidateNotification() {
    return getPeriodeTitle(appelOffreId, periodeId).andThen(({ periodeTitle, appelOffreTitle }) => {
      const subject = `Résultats de la ${periodeTitle} période de l'appel d'offres ${appelOffreTitle}`

      return wrapInfra(
        sendNotification({
          type: 'designation',
          context: {
            appelOffreId,
            periodeId,
          },
          variables: {
            invitation_link: routes.USER_DASHBOARD,
          },
          message: {
            subject,
            email: candidateEmail,
            name: candidateName,
          },
        })
      )
    })
  }
}
