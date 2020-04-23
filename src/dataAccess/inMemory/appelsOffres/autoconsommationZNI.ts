import { AppelOffre } from '../../../entities'
import { commonDataFields } from './commonDataFields'
import toTypeLiteral from './helpers/toTypeLiteral'

const autoconsommationZNI: AppelOffre = {
  id: 'CRE4 - Autoconsommation ZNI',
  title:
    '2016/S 242-441979 portant sur la réalisation et l’exploitation d’Installations de production  d’électricité à partir d’énergies renouvelables en autoconsommation et situées dans les zones non interconnectées.',
  shortTitle: 'CRE4 - Autoconsommation ZNI 2016/S 242-441979',
  launchDate: 'Juin 2019',
  unitePuissance: 'MWc',
  delaiRealisationEnMois: 30,
  paragraphePrixReference: '7.2',
  paragrapheDelaiDerogatoire: '6.3',
  paragrapheAttestationConformite: '6.4',
  paragrapheEngagementIPFP: '',
  afficherParagrapheInstallationMiseEnServiceModification: true,
  renvoiModification: '5.3',
  affichageParagrapheECS: false,
  renvoiDemandeCompleteRaccordement: '6.1',
  renvoiRetraitDesignationGarantieFinancieres: '',
  renvoiEngagementIPFP: '',
  paragrapheClauseCompetitivite: '2.10',
  tarifOuPrimeRetenue: 'la prime retenue',
  afficherValeurEvaluationCarbone: false,
  afficherPhraseRegionImplantation: false,
  dataFields: [
    ...commonDataFields,
    {
      field: 'evaluationCarbone',
      type: toTypeLiteral('orNumberInColumn'),
      defaultValue: -1, // Accept null values
      column:
        'Evaluation carbone simplifiée indiquée au C. du formulaire de candidature et arrondie (kg eq CO2/kWc)',
      value: 'Valeur de l’évaluation carbone des modules (kg eq CO2/kWc)',
    },
  ],
  periodes: [
    {
      id: '1',
      title: 'première',
      canGenerateCertificate: true,
    },
  ],
  familles: [],
}

export { autoconsommationZNI }