import moment from 'moment'
import { okAsync } from 'neverthrow'
import { ResultAsync, errAsync, logger, ok, wrapInfra } from '../../../core/utils'
import { getAppelOffre } from '../../../dataAccess/inMemory/appelOffre'
import { makeProjectIdentifier } from '../../../entities'
import { formatDate } from '../../../helpers/formatDate'
import { GetPeriode } from '../../../modules/appelOffre'
import {
  GetModificationRequestDateForResponseTemplate,
  ModificationRequestDateForResponseTemplateDTO,
} from '../../../modules/modificationRequest'
import { EntityNotFoundError, InfraNotAvailableError } from '../../../modules/shared'

interface GetModificationRequestDateForResponseTemplateDeps {
  models: any
  getPeriode: GetPeriode
}

export const makeGetModificationRequestDataForResponseTemplate = ({
  models,
  getPeriode,
}: GetModificationRequestDateForResponseTemplateDeps): GetModificationRequestDateForResponseTemplate => (
  modificationRequestId,
  user
) => {
  const { ModificationRequest, Project, File, User } = models
  if (!ModificationRequest || !Project || !File || !User)
    return errAsync(new InfraNotAvailableError())

  return _getModificationRequestById(modificationRequestId, models)
    .andThen(
      (
        modificationRequest: any
      ): ResultAsync<
        { modificationRequest: any; previousRequest: any },
        EntityNotFoundError | InfraNotAvailableError
      > => {
        if (!modificationRequest) return errAsync(new EntityNotFoundError())

        const { type, projectId } = modificationRequest
        if (type === 'delai') {
          return _getPreviouslyAcceptedDelaiRequest(projectId, models).map((previousRequest) => ({
            modificationRequest,
            previousRequest,
          }))
        }

        return okAsync({ modificationRequest, previousRequest: null })
      }
    )
    .andThen(({ modificationRequest, previousRequest }) =>
      getPeriode(
        modificationRequest.project.appelOffreId,
        modificationRequest.project.periodeId
      ).map((periodeDetails) => ({ modificationRequest, previousRequest, periodeDetails }))
    )
    .andThen(({ modificationRequest, previousRequest, periodeDetails }) => {
      const {
        type,
        project,
        requestedOn,
        delayInMonths,
        justification,
        status,
        confirmationRequestedOn,
        confirmedOn,
      } = modificationRequest

      const { appelOffreId, periodeId, familleId } = project
      const appelOffre = getAppelOffre({ appelOffreId, periodeId })
      const periode = appelOffre?.periodes.find((periode) => periode.id === periodeId)
      const famille = appelOffre?.familles.find((famille) => famille.id === familleId)

      if (!appelOffre || !periode) {
        logger.error(
          new Error(
            `getModificationRequestDataForResponseTemplate failed to find the appelOffre for this id ${appelOffreId}`
          )
        )
        return errAsync(new InfraNotAvailableError())
      }

      const {
        nomRepresentantLegal,
        nomCandidat,
        details,
        email,
        nomProjet,
        puissance,
        codePostalProjet,
        communeProjet,
        completionDueOn,
        motifsElimination,
        prixReference,
        evaluationCarbone,
        isFinancementParticipatif,
        isInvestissementParticipatif,
        engagementFournitureDePuissanceAlaPointe,
        notifiedOn,
      } = project

      const {
        tarifOuPrimeRetenue,
        tarifOuPrimeRetenueAlt,
        paragraphePrixReference,
        affichageParagrapheECS,
        unitePuissance,
        renvoiDemandeCompleteRaccordement,
        renvoiRetraitDesignationGarantieFinancieres,
        paragrapheDelaiDerogatoire,
        paragrapheAttestationConformite,
        paragrapheEngagementIPFP,
        renvoiModification,
        delaiRealisationTexte,
        renvoiSoumisAuxGarantiesFinancieres,
      } = appelOffre

      const commonData = {
        type,
        suiviPar: user.fullName,
        refPotentiel: makeProjectIdentifier(project),
        nomRepresentantLegal,
        nomCandidat,
        status,
        adresseCandidat: details['Adresse postale du contact'],
        email,
        titrePeriode: periode.title,
        titreAppelOffre: appelOffre.title,
        familles: appelOffre.familles.length ? 'yes' : '',
        titreFamille: familleId,
        nomProjet,
        puissance: puissance.toString(),
        codePostalProjet,
        communeProjet,
        unitePuissance,
        dateDemande: formatDate(requestedOn),
        justificationDemande: justification,
      }

      const soumisAuxGarantiesFinancieres =
        project.appelOffreId === 'Eolien' ||
        famille?.garantieFinanciereEnMois ||
        famille?.soumisAuxGarantiesFinancieres

      switch (type) {
        case 'delai':
          return ok({
            ...commonData,
            referenceParagrapheAchevement: periode.paragrapheAchevement,
            contenuParagrapheAchevement: appelOffre.contenuParagrapheAchevement,
            dateLimiteAchevementInitiale: formatDate(
              +moment(notifiedOn).add(appelOffre.delaiRealisationEnMois, 'months')
            ),
            dateLimiteAchevementActuelle: formatDate(completionDueOn),
            dateNotification: formatDate(notifiedOn),
            dureeDelaiDemandeEnMois: delayInMonths.toString(),
            ..._makePreviousDelaiFromPreviousRequest(previousRequest),
          } as ModificationRequestDateForResponseTemplateDTO)
        case 'abandon':
          return ok({
            ...commonData,
            referenceParagrapheAbandon:
              periodeDetails[
                'Référence du paragraphe dédié à l’engagement de réalisation ou aux modalités d’abandon'
              ],
            contenuParagrapheAbandon:
              periodeDetails[
                'Dispositions liées à l’engagement de réalisation ou aux modalités d’abandon'
              ],
            dateNotification: formatDate(notifiedOn),
            dateDemandeConfirmation: confirmationRequestedOn && formatDate(confirmationRequestedOn),
            dateConfirmation: confirmedOn && formatDate(confirmedOn),
          } as ModificationRequestDateForResponseTemplateDTO)
        case 'recours':
          return ok({
            ...commonData,
            prixReference: prixReference.toString(),
            evaluationCarbone: evaluationCarbone.toString(),
            isFinancementParticipatif: isFinancementParticipatif ? 'yes' : '',
            isInvestissementParticipatif: isInvestissementParticipatif ? 'yes' : '',
            isEngagementParticipatif:
              isFinancementParticipatif || isInvestissementParticipatif ? 'yes' : '',
            engagementFournitureDePuissanceAlaPointe: engagementFournitureDePuissanceAlaPointe
              ? 'yes'
              : '',

            nonInstruit: motifsElimination.toLowerCase().includes('non instruit') ? 'yes' : '',
            motifsElimination,
            tarifOuPrimeRetenue,
            tarifOuPrimeRetenueAlt,
            paragraphePrixReference,
            affichageParagrapheECS: affichageParagrapheECS ? 'yes' : '',
            unitePuissance,
            eolien: appelOffreId === 'Eolien' ? 'yes' : '',
            AOInnovation: appelOffreId === 'CRE4 - Innovation' ? 'yes' : '',
            soumisGF: soumisAuxGarantiesFinancieres ? 'yes' : '',
            renvoiSoumisAuxGarantiesFinancieres,
            renvoiDemandeCompleteRaccordement,
            renvoiRetraitDesignationGarantieFinancieres,
            paragrapheDelaiDerogatoire,
            paragrapheAttestationConformite,
            paragrapheEngagementIPFP,
            renvoiModification,
            delaiRealisationTexte,
          } as ModificationRequestDateForResponseTemplateDTO)
      }

      return errAsync(new EntityNotFoundError())
    })
}

function _getModificationRequestById(modificationRequestId, models) {
  const { ModificationRequest, Project } = models

  return wrapInfra(
    ModificationRequest.findByPk(modificationRequestId, {
      include: [
        {
          model: Project,
          as: 'project',
        },
      ],
    })
  ).map((rawData: any) => rawData?.get())
}

function _getPreviouslyAcceptedDelaiRequest(projectId, models) {
  const { ModificationRequest } = models

  return wrapInfra(
    ModificationRequest.findOne({
      where: {
        projectId,
        status: 'acceptée',
        type: 'delai',
      },
    })
  ).map((rawData: any) => rawData?.get())
}

function _makePreviousDelaiFromPreviousRequest(previousRequest) {
  if (!previousRequest) return { demandePrecedente: '' }

  const { requestedOn, delayInMonths, acceptanceParams, respondedOn } = previousRequest

  return {
    demandePrecedente: 'yes',
    dateDepotDemandePrecedente: formatDate(requestedOn),
    dureeDelaiDemandePrecedenteEnMois: delayInMonths.toString(),
    dateReponseDemandePrecedente: formatDate(respondedOn),
    autreDelaiDemandePrecedenteAccorde:
      delayInMonths !== acceptanceParams.delayInMonths ? 'yes' : '',
    delaiDemandePrecedenteAccordeEnMois: acceptanceParams.delayInMonths.toString(),
  }
}
