import { errAsync, wrapInfra } from '../../../core/utils'
import { Op, QueryTypes } from 'sequelize'
import { InfraNotAvailableError } from '../../../modules/shared'
import { GetStats } from '../../../modules/stats/GetStats'
import { sequelizeInstance } from '../../../sequelize.config'
import models from '../models'

const FIRST_NOTIFICATION_DATE = 1586901600000
const DOWNLOADS_BEFORE_EVENT_SOURCING = 655

export const getStats: GetStats = () => {
  const ProjectModel = models.Project
  const EventModel = models.EventStore
  if (!ProjectModel || !EventModel) return errAsync(new InfraNotAvailableError())

  const _getProjetsTotal = async () =>
    await ProjectModel.count({
      where: { notifiedOn: { [Op.ne]: 0 } },
    })

  const _getProjetsLaureats = async () =>
    await ProjectModel.count({
      where: { classe: 'Classé', notifiedOn: { [Op.ne]: 0 } },
    })

  const _getPorteursProjetNotifies = async () =>
    await ProjectModel.count({
      where: { notifiedOn: { [Op.gte]: FIRST_NOTIFICATION_DATE } }, // Only count those after 15/04/2020 which is the first time projects have been notified on Potentiel
      distinct: true,
      col: 'email',
    })

  const _getPorteursProjetNotifiesInscrits = async () =>
    (
      await sequelizeInstance.query(
        'SELECT COUNT(DISTINCT(projects.email)) as count FROM projects INNER JOIN users ON users.email = projects.email;',
        { type: QueryTypes.SELECT }
      )
    )[0].count

  const _getParrainages = async () =>
    (
      await sequelizeInstance.query(
        "SELECT COUNT(DISTINCT(users.email)) FROM notifications INNER JOIN users on notifications.message ->> 'email' = users.email where type = 'project-invitation';",
        { type: QueryTypes.SELECT }
      )
    )[0].count

  const _getDownloadsSinceEventSourcing = async () =>
    await EventModel.count({
      where: { type: 'ProjectCertificateDownloaded' },
      distinct: true,
      col: 'aggregateId',
    })

  const _getProjetsAvecAttestation = async () =>
    await ProjectModel.count({
      where: {
        notifiedOn: { [Op.gte]: FIRST_NOTIFICATION_DATE },
        certificateFileId: { [Op.ne]: null },
      },
    })

  const _getGfDeposees = async () =>
    await EventModel.count({
      where: { type: 'ProjectGFSubmitted' },
      distinct: true,
      col: 'aggregateId',
    })

  const _getGfDues = async () =>
    await ProjectModel.count({
      where: {
        [Op.and]: [
          { garantiesFinancieresDueOn: { [Op.lt]: Date.now() } },
          { garantiesFinancieresDueOn: { [Op.gt]: 0 } },
        ],
      },
    })

  const _getDcrDeposees = async () =>
    await EventModel.count({
      where: { type: 'ProjectDCRSubmitted' },
      distinct: true,
      col: 'aggregateId',
    })

  const _getDcrDues = async () =>
    await ProjectModel.count({
      where: {
        [Op.and]: [{ dcrDueOn: { [Op.lt]: Date.now() } }, { dcrDueOn: { [Op.gt]: 0 } }],
      },
    })

  const _getDemandes = async () =>
    (
      await sequelizeInstance.query('SELECT type FROM "modificationRequests";', {
        type: QueryTypes.SELECT,
      })
    ).reduce(
      (map, demande: any) => {
        map[demande.type] += 1
        return map
      },
      {
        actionnaire: 0,
        producteur: 0,
        fournisseur: 0,
        puissance: 0,
        abandon: 0,
        recours: 0,
        delai: 0,
      }
    )

  return wrapInfra(
    Promise.all([
      _getProjetsTotal(),
      _getProjetsLaureats(),
      _getPorteursProjetNotifies(),
      _getPorteursProjetNotifiesInscrits(),
      _getParrainages(),
      _getDownloadsSinceEventSourcing(),
      _getProjetsAvecAttestation(),
      _getGfDeposees(),
      _getGfDues(),
      _getDcrDeposees(),
      _getDcrDues(),
      _getDemandes(),
    ])
  ).map(
    ([
      projetsTotal,
      projetsLaureats,
      porteursProjetNotifies,
      porteursProjetNotifiesInscrits,
      parrainages,
      downloadsSinceEventSourcing,
      projetsAvecAttestation,
      gfDeposees,
      gfDues,
      dcrDeposees,
      dcrDues,
      demandes,
    ]) => ({
      projetsTotal,
      projetsLaureats,
      porteursProjetNotifies,
      porteursProjetNotifiesInscrits,
      parrainages,
      telechargementsAttestation: DOWNLOADS_BEFORE_EVENT_SOURCING + downloadsSinceEventSourcing,
      projetsAvecAttestation,
      gfDeposees,
      gfDues,
      dcrDeposees,
      dcrDues,
      demandes,
    })
  )
}
