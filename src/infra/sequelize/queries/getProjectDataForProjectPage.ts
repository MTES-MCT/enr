import { err, errAsync, ok, wrapInfra } from '../../../core/utils'
import { getAppelOffre } from '../../../dataAccess/inMemory'
import { ProjectDataForProjectPage } from '../../../modules/project/dtos'
import { GetProjectDataForProjectPage } from '../../../modules/project/queries/GetProjectDataForProjectPage'
import { EntityNotFoundError, InfraNotAvailableError } from '../../../modules/shared'

export const makeGetProjectDataForProjectPage = (models): GetProjectDataForProjectPage => ({
  projectId,
  user,
}) => {
  const { Project, File, User, UserProjects, ProjectAdmissionKey, ProjectStep } = models
  if (!Project || !File || !User || !UserProjects || !ProjectAdmissionKey || !ProjectStep)
    return errAsync(new InfraNotAvailableError())

  return wrapInfra(
    Project.findByPk(projectId, {
      include: [
        {
          model: File,
          as: 'certificateFile',
          attributes: ['id', 'filename'],
        },
        {
          model: UserProjects,
          as: 'users',
          where: { projectId },
          required: false,
          include: [
            {
              model: User,
              attributes: ['id', 'fullName', 'email'],
            },
          ],
        },
        {
          model: ProjectAdmissionKey,
          as: 'invitations',
          where: {
            cancelled: false,
            lastUsedAt: 0,
          },
          attributes: ['id', 'email'],
          required: false,
        },
        {
          model: ProjectAdmissionKey,
          as: 'invitationsForProjectEmail',
          where: {
            cancelled: false,
            lastUsedAt: 0,
          },
          attributes: ['id', 'email'],
          required: false,
        },
        {
          model: ProjectStep,
          as: 'gf',
          required: false,
          include: [
            {
              model: File,
              as: 'file',
              attributes: ['id', 'filename'],
            },
          ],
        },
        {
          model: ProjectStep,
          as: 'dcr',
          required: false,
          include: [
            {
              model: File,
              as: 'file',
              attributes: ['id', 'filename'],
            },
          ],
        },
        {
          model: ProjectStep,
          as: 'ptf',
          required: false,
          include: [
            {
              model: File,
              as: 'file',
              attributes: ['id', 'filename'],
            },
          ],
        },
      ],
    })
  ).andThen((projectRaw: any) => {
    if (!projectRaw) return err(new EntityNotFoundError())

    const {
      id,
      appelOffreId,
      periodeId,
      familleId,
      numeroCRE,
      puissance,
      prixReference,
      engagementFournitureDePuissanceAlaPointe,
      isFinancementParticipatif,
      isInvestissementParticipatif,
      adresseProjet,
      codePostalProjet,
      communeProjet,
      departementProjet,
      regionProjet,
      territoireProjet,
      nomProjet,
      nomCandidat,
      nomRepresentantLegal,
      email,
      fournisseur,
      evaluationCarbone,
      note,
      details,
      notifiedOn,
      abandonedOn,
      certificateFile,
      classe,
      motifsElimination,
      garantiesFinancieresDueOn,
      dcrDueOn,
      users,
      invitations,
      invitationsForProjectEmail,
      gf,
      dcr,
      ptf,
      completionDueOn,
      updatedAt,
    } = projectRaw.get()

    let allInvitations: any[] = []
    if (invitations) {
      allInvitations = [...allInvitations, ...invitations.map((item) => item.get())]
    }

    if (invitationsForProjectEmail) {
      allInvitations = [...allInvitations, ...invitationsForProjectEmail.map((item) => item.get())]
    }

    const result: any = {
      id,
      appelOffreId,
      periodeId,
      familleId,
      appelOffre: getAppelOffre({ appelOffreId, periodeId, familleId }),
      numeroCRE,
      puissance,
      engagementFournitureDePuissanceAlaPointe,
      isFinancementParticipatif,
      isInvestissementParticipatif,
      adresseProjet,
      codePostalProjet,
      communeProjet,
      departementProjet,
      regionProjet,
      territoireProjet,
      nomProjet,
      nomCandidat,
      nomRepresentantLegal,
      email,
      fournisseur,
      evaluationCarbone,
      note,
      details,
      notifiedOn: notifiedOn ? new Date(notifiedOn) : undefined,
      completionDueOn: completionDueOn ? new Date(completionDueOn) : undefined,
      isClasse: classe === 'Classé',
      isAbandoned: abandonedOn !== 0,
      motifsElimination,
      users: users?.map(({ user }) => user),
      invitations: allInvitations,
      garantiesFinancieres: undefined,
      updatedAt,
    }

    if (user.role !== 'dreal') {
      result.prixReference = prixReference
    }

    if (!notifiedOn) return ok(result)

    if (user.role !== 'dreal') {
      result.certificateFile = certificateFile?.get()
    }

    if (garantiesFinancieresDueOn) {
      result.garantiesFinancieres = { dueOn: new Date(garantiesFinancieresDueOn) }
    }

    if (dcrDueOn) {
      result.dcr = { dueOn: new Date(dcrDueOn) }
    }

    if (gf) {
      const { submittedOn, status, file, stepDate } = gf

      result.garantiesFinancieres = {
        ...result.garantiesFinancieres,
        submittedOn,
        file: file?.get(),
        gfDate: stepDate,
        gfStatus: status,
      }
    }

    if (ptf) {
      const { submittedOn, file, stepDate } = ptf
      result.ptf = {
        ...result.ptf,
        submittedOn,
        file: file?.get(),
        ptfDate: stepDate,
      }
    }

    if (dcr) {
      const {
        submittedOn,
        file,
        stepDate,
        details: { numeroDossier },
      } = dcr
      result.dcr = {
        ...result.dcr,
        submittedOn,
        file: file?.get(),
        dcrDate: stepDate,
        numeroDossier,
      }
    }

    return ok(result)
  })
}
