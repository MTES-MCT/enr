import { Pagination } from '../../types'
import { listProjects } from '../../useCases'
import { makePagination } from '../../helpers/paginate'
import routes from '../../routes'
import { parseAsync } from 'json2csv'
import { logger } from '../../core/utils'
import { v1Router } from '../v1Router'
import asyncHandler from 'express-async-handler'
import { ensureRole } from '../auth'
import { promises as fsPromises } from 'fs'
import moment from 'moment'
import { Project } from '../../entities'
import { formatField, writeCsvOnDisk } from '../../helpers/csv'

const orderedFields = [
  { dataField: 'numeroCRE', visibility: ['*'] },
  { dataField: 'appelOffreId', visibility: ['*'] },
  { dataField: 'periodeId', visibility: ['*'] },
  { dataField: 'familleId', visibility: ['*'] },
  { dataField: 'Candidat', visibility: ['*'] },
  { dataField: 'Société mère', visibility: ['*'] },
  { dataField: 'nomProjet', visibility: ['*'] },
  { dataField: 'Territoire\n(AO ZNI)', visibility: ['*'] },
  { dataField: 'puissance', visibility: ['*'] },
  { dataField: 'prixReference', visibility: ['admin', 'porteur-projet', 'acheteur-obligé'] },
  { dataField: "Taux d'autoconsommation \n(AO autoconsommation)", visibility: ['*'] },
  { dataField: 'evaluationCarbone', visibility: ['*'] },
  { dataField: 'Note prix', visibility: ['admin', 'acheteur-obligé'] },
  { dataField: 'Note carbone', visibility: ['admin', 'acheteur-obligé'] },
  { dataField: 'Note environnementale', visibility: ['admin', 'acheteur-obligé'] },
  { dataField: 'Note innovation\n(AO innovation)', visibility: ['admin', 'acheteur-obligé'] },
  { dataField: 'note', visibility: ['admin', 'acheteur-obligé'] },
  { dataField: 'nomCandidat', visibility: ['*'] },
  { dataField: 'Nature du candidat', visibility: ['*'] },
  { dataField: 'Numéro SIREN ou SIRET*', visibility: ['*'] },
  { dataField: 'Code NACE', visibility: ['*'] },
  { dataField: 'Type entreprise', visibility: ['*'] },
  { dataField: "Région d'implantation", visibility: ['*'] },
  { dataField: 'Adresse', visibility: ['*'] },
  { dataField: 'nomRepresentantLegal', visibility: ['*'] },
  { dataField: 'Titre du représentant légal', visibility: ['*'] },
  { dataField: 'Nom et prénom du signataire du formulaire', visibility: ['*'] },
  { dataField: 'Nom et prénom du contact', visibility: ['*'] },
  { dataField: 'Titre du contact', visibility: ['*'] },
  { dataField: 'Adresse postale du contact', visibility: ['*'] },
  { dataField: 'email', visibility: ['*'] },
  { dataField: 'Téléphone', visibility: ['*'] },
  { dataField: 'Nom du projet', visibility: ['*'] },
  { dataField: "Nb d'aérogénérateurs\n(AO éolien)", visibility: ['*'] },
  { dataField: 'Famille de candidature', visibility: ['*'] },
  { dataField: 'Puissance installée (MWc)', visibility: ['*'] },
  { dataField: 'Type de consommateur associé\n(AO autoconsommation)', visibility: ['*'] },
  {
    dataField: 'Nature et nombre du ou des consommateur(s)\n(AO autoconsommation)',
    visibility: ['*'],
  },
  { dataField: 'Typologie de projet', visibility: ['*'] },
  { dataField: 'adresseProjet', visibility: ['*'] },
  { dataField: 'codePostalProjet', visibility: ['*'] },
  { dataField: 'communeProjet', visibility: ['*'] },
  { dataField: 'departementProjet', visibility: ['*'] },
  { dataField: 'regionProjet', visibility: ['*'] },
  {
    dataField: 'Coordonnées géodésiques WGS84 du barycentre de l’Installation : Latitude (degrés)',
    visibility: ['*'],
  },
  {
    dataField: 'Coordonnées géodésiques WGS84 du barycentre de l’Installation : Latitude (minutes)',
    visibility: ['*'],
  },
  {
    dataField:
      'Coordonnées géodésiques WGS84 du barycentre de l’Installation : Latitude (secondes)',
    visibility: ['*'],
  },
  {
    dataField:
      'Coordonnées géodésiques WGS84 du barycentre de l’Installation : Latitude (cardinal)',
    visibility: ['*'],
  },
  {
    dataField: 'Coordonnées géodésiques WGS84du barycentre de l’Installation : Longitude\n(degrés)',
    visibility: ['*'],
  },
  {
    dataField:
      'Coordonnées géodésiques WGS84du barycentre de l’Installation : Longitude\n(minutes)',
    visibility: ['*'],
  },
  {
    dataField:
      'Coordonnées géodésiques WGS84du barycentre de l’Installation : Longitude\n(secondes)',
    visibility: ['*'],
  },
  {
    dataField:
      'Coordonnées géodésiques WGS84du barycentre de l’Installation : Longitude\n(cardinal)',
    visibility: ['*'],
  },
  { dataField: 'Taux occupation toiture\n(AO autoconsommation)', visibility: ['*'] },
  {
    dataField: 'Surface projetée au sol de l’ensemble des Capteurs solaires (ha)',
    visibility: ['*'],
  },
  { dataField: 'Surface du Terrain d’implantation (ha)', visibility: ['*'] },
  { dataField: 'Référence du dossier de raccordement*', visibility: ['*'] },
  { dataField: 'Dépôt 1ère périodes précédentes ?', visibility: ['*'] },
  {
    dataField: 'Prix de référence (€/MWh)',
    visibility: ['admin', 'porteur-projet', 'acheteur-obligé'],
  },
  { dataField: 'Valeur de l’évaluation carbone des modules (kg eq CO2/kWc)', visibility: ['*'] },
  { dataField: 'Engagement de fourniture de puissance à la pointe\n(AO ZNI)', visibility: ['*'] },
  { dataField: 'Terrain d’implantation est dégradé au sens du cas 3 du 2.6', visibility: ['*'] },
  {
    dataField: 'Terrain d’implantation bénéficie de la dérogation sur le c) du Cas 2 du 2.6',
    visibility: ['*'],
  },
  { dataField: 'Détention de l’Autorisation d’Urbanisme', visibility: ['*'] },
  { dataField: 'Coût total du lot (M€)\n(Développement)', visibility: ['admin', 'porteur-projet'] },
  {
    dataField: 'Contenu local français (%)\n(Développement)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local européen (%)\n(Développement)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local développement :\nCommentaires',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local Fabrication de composants et assemblage :\nTotal coût du lot (M€)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField:
      'Contenu local Fabrication de composants et assemblage :\nPourcentage de contenu local français (%)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField:
      'Contenu local Fabrication de composants et assemblage :\nPourcentage de contenu local européen (%)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local Fabrication de composants et assemblage :\nCommentaires',
    visibility: ['admin', 'porteur-projet'],
  },
  { dataField: 'Technologie (Modules ou films)', visibility: ['*'] },
  { dataField: 'Référence commerciale \n(Modules ou films)', visibility: ['*'] },
  { dataField: 'Nom du fabricant \n(Modules ou films)', visibility: ['*'] },
  { dataField: 'Lieu(x) de fabrication \n(Modules ou films)', visibility: ['*'] },
  { dataField: 'Puissance crête (Wc) \n(Modules ou films)', visibility: ['*'] },
  { dataField: 'Rendement nominal \n(Modules ou films)', visibility: ['*'] },
  { dataField: 'Coût des modules €/Wc', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Diamètre du rotor (m)\n(AO éolien)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Hauteur bout de pâle (m)\n(AO éolien)', visibility: ['admin', 'porteur-projet'] },
  {
    dataField: 'Coût total du lot (M€)\n(Modules ou films)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local français (%)\n(Modules ou films)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local européen (%)\n(Modules ou films)',
    visibility: ['admin', 'porteur-projet'],
  },
  { dataField: 'Nom du fabricant (Cellules)', visibility: ['*'] },
  { dataField: 'Lieu(x) de fabrication (Cellules)', visibility: ['*'] },
  { dataField: 'Coût total du lot (M€)\n(Cellules)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Contenu local français (%)\n(Cellules)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Contenu local européen (%)\n(Cellules)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Nom du fabricant \n(Plaquettes de silicium (wafers))', visibility: ['*'] },
  { dataField: 'Lieu(x) de fabrication \n(Plaquettes de silicium (wafers))', visibility: ['*'] },
  {
    dataField: 'Coût total du lot (M€)\n(Plaquettes de silicium (wafers))',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local français (%)\n(Plaquettes de silicium (wafers))',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local européen (%)\n(Plaquettes de silicium (wafers))',
    visibility: ['admin', 'porteur-projet'],
  },
  { dataField: 'Nom du fabricant \n(Polysilicium)', visibility: ['*'] },
  { dataField: 'Lieu(x) de fabrication \n(Polysilicium)', visibility: ['*'] },
  { dataField: 'Coût total du lot (M€)\n(Polysilicium)', visibility: ['admin', 'porteur-projet'] },
  {
    dataField: 'Contenu local français (%)\n(Polysilicium)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local européen (%)\n(Polysilicium)',
    visibility: ['admin', 'porteur-projet'],
  },
  { dataField: 'Nom du fabricant \n(Postes de conversion)', visibility: ['*'] },
  { dataField: 'Lieu(x) de fabrication \n(Postes de conversion)', visibility: ['*'] },
  {
    dataField: 'Coût total du lot (M€)\n(Postes de conversion)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local français (%)\n(Postes de conversion)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local européen (%)\n(Postes de conversion)',
    visibility: ['admin', 'porteur-projet'],
  },
  { dataField: 'Nom du fabricant \n(Structure)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Lieu(x) de fabrication \n(Structure)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Coût total du lot (M€)\n(Structure)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Contenu local français (%)\n(Structure)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Contenu local européen (%)\n(Structure)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Technologie \n(Dispositifs de stockage de l’énergie *)', visibility: ['*'] },
  { dataField: 'Nom du fabricant \n(Dispositifs de stockage de l’énergie *)', visibility: ['*'] },
  {
    dataField: 'Lieu(x) de fabrication \n(Dispositifs de stockage de l’énergie *)',
    visibility: ['*'],
  },
  {
    dataField: 'Coût total du lot (M€)\n(Dispositifs de stockage de l’énergie *)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local français (%)\n(Dispositifs de stockage de l’énergie *)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local européen (%)\n(Dispositifs de stockage de l’énergie *)',
    visibility: ['admin', 'porteur-projet'],
  },
  { dataField: 'Technologie \n(Dispositifs de suivi de la course du soleil *)', visibility: ['*'] },
  {
    dataField: 'Nom du fabricant \n(Dispositifs de suivi de la course du soleil *)',
    visibility: ['*'],
  },
  {
    dataField: 'Lieu(x) de fabrication \n(Dispositifs de suivi de la course du soleil *)',
    visibility: ['*'],
  },
  {
    dataField: 'Coût total du lot (M€)\n(Dispositifs de suivi de la course du soleil *)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local français (%)\n(Dispositifs de suivi de la course du soleil *)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local européen (%)\n(Dispositifs de suivi de la course du soleil *)',
    visibility: ['admin', 'porteur-projet'],
  },
  { dataField: 'Référence commerciale \n(Autres technologies)', visibility: ['*'] },
  { dataField: 'Nom du fabricant \n(Autres technologies)', visibility: ['*'] },
  { dataField: 'Lieu(x) de fabrication \n(Autres technologies)', visibility: ['*'] },
  {
    dataField: 'Coût total du lot (M€)\n(Autres technologies)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local français (%)\n(Autres technologies)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local européen (%)\n(Autres technologies)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Coût total du lot (M€)\n(Installation et mise en service )',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local français (%)\n(Installation et mise en service) ',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local européen (%)\n(Installation et mise en service)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Commentaires contenu local\n(Installation et mise en service)',
    visibility: ['admin', 'porteur-projet'],
  },
  { dataField: 'Coût total du lot (M€)\n(raccordement)', visibility: ['admin', 'porteur-projet'] },
  {
    dataField: 'Contenu local français (%)\n(raccordement)',
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: 'Contenu local européen (%)\n(raccordement)',
    visibility: ['admin', 'porteur-projet'],
  },
  { dataField: 'Contenu local TOTAL :\ncoût total (M€)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Contenu local TOTAL français (%)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Contenu local TOTAL européen (%)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Contenu local TOTAL :\nCommentaires', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Ensoleillement de référence (kWh/m²/an)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Productible annuel (MWh/an)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Facteur de charges (kWh/kWc)', visibility: ['admin', 'porteur-projet'] },
  {
    dataField: 'Date de mise en service du raccordement attendue (mm/aaaa)',
    visibility: ['admin', 'porteur-projet'],
  },
  { dataField: 'Capacité du raccordement (kW)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Montant estimé du raccordement (k€)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Raccordement € / kWc', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'Investissement total (k€)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'dont quantité de fonds propres (k€)', visibility: ['admin', 'porteur-projet'] },
  { dataField: "dont quantité d'endettement  (k€)", visibility: ['admin', 'porteur-projet'] },
  {
    dataField: "dont quantité de subventions à l'investissement  (k€)",
    visibility: ['admin', 'porteur-projet'],
  },
  {
    dataField: "dont quantité d'autres avantages financiers  (k€)",
    visibility: ['admin', 'porteur-projet'],
  },
  { dataField: 'Location (€/an/MWc)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'CAPEX Moyen\n(k€ / MWc)', visibility: ['admin', 'porteur-projet'] },
  { dataField: 'date\n(candidature)', visibility: ['admin', 'dreal'] },
  { dataField: 'heure\n(candidature)', visibility: ['admin', 'dreal'] },
  { dataField: 'Reference Pli\n(candidature)', visibility: ['admin', 'dreal'] },
  { dataField: 'Typologie de projet', visibility: ['admin', 'dreal'] },
  { dataField: "Condition d'admissibilité ?\n(AO éolien)", visibility: ['admin'] },
  { dataField: "Type d'utorisation d'Urbanisme (pièce n°3)", visibility: ['admin', 'dreal'] },
  {
    dataField: 'Investissement ou financement participatif ?',
    fn: (row) => row.isInvestissementParticipatif || row.isFinancementParticipatif,
    visibility: ['admin', 'dreal', 'acheteur-obligé'],
  },
  {
    dataField: '€/MWh bonus participatif',
    visibility: ['admin', 'porteur-projet', 'acheteur-obligé'],
  },
  { dataField: 'Note degré d’innovation (/20pt)\n(AO innovation)', visibility: ['admin'] },
  {
    dataField: 'Commentaire final sur note degré d’innovation\n(AO innovation)',
    visibility: ['admin'],
  },
  { dataField: "Nom de l'innovation (ADEME)\n(AO innovation)", visibility: ['admin'] },
  { dataField: "Type de l'innovation (ADEME)\n(AO innovation)", visibility: ['admin'] },
  {
    dataField: "Note synergie avec l'usage agricole (/10pt)\n(AO Innovation)",
    visibility: ['admin'],
  },
  {
    dataField: "Commentaire final sur note synergie avec l'usage agricole \n(AO Innovation)",
    visibility: ['admin'],
  },
  {
    dataField: 'Note positionnement sur le marché (/10pt)\n(AO innovation)',
    visibility: ['admin'],
  },
  {
    dataField: 'Commentaire final sur note positionnement sur le marché \n(AO innovation)',
    visibility: ['admin'],
  },
  { dataField: 'Note qualité technique (/5pt)\n(AO innovation)', visibility: ['admin'] },
  {
    dataField: 'Commentaire final sur note qualité technique\n(AO innovation)',
    visibility: ['admin'],
  },
  {
    dataField: 'Note adéquation du projet avec les ambitions industrielles (/5pt)\n(AO innovation)',
    visibility: ['admin'],
  },
  {
    dataField:
      'Commentaire final sur note adéquation du projet avec les ambitions industrielles\n(AO innovation)',
    visibility: ['admin'],
  },
  {
    dataField: 'Note aspects environnementaux et sociaux (/5pt)\n(AO innovation)',
    visibility: ['admin'],
  },
  {
    dataField: 'Commentaire final sur note aspects environnementaux et sociaux\n(AO innovation)',
    visibility: ['admin'],
  },
  { dataField: "Respect de toutes les conditions d'admissibilité ?", visibility: ['admin'] },
  { dataField: 'Suspicion de doublon ? ', visibility: ['admin'] },
  { dataField: 'Oui projet ', visibility: ['admin'] },
  { dataField: 'Suspicion de 500m inter-famille ? ', visibility: ['admin'] },
  { dataField: 'Avis admissibilité', visibility: ['admin'] },
  { dataField: 'Comm 1 \n(pièce n°1)', visibility: ['admin'] },
  { dataField: 'Comm 2 \n(pièce n°1)', visibility: ['admin'] },
  { dataField: 'Avis \n(pièce n°1)', visibility: ['admin'] },
  { dataField: 'Comm 1 \n(pièce n°2)', visibility: ['admin'] },
  { dataField: 'Comm 2 \n(pièce n°2)', visibility: ['admin'] },
  { dataField: 'Avis \n(pièce n°2)', visibility: ['admin'] },
  { dataField: "Type de terrain d'implantation \n(pièce n°3)", visibility: ['admin'] },
  {
    dataField: "Période visée par certificat d'éligibilité du terrain \n(pièce n°3)",
    visibility: ['admin'],
  },
  { dataField: 'Comm 1 \n(pièce n°3)', visibility: ['admin'] },
  { dataField: 'Comm 2\n(pièce n°3)', visibility: ['admin'] },
  { dataField: 'Types Cas 3 \n(pièce n°3)', visibility: ['admin'] },
  { dataField: 'Avis \n(pièce n°3)', visibility: ['admin'] },
  { dataField: 'Comm 1\n(pièce n°4 AO innovation)', visibility: ['admin'] },
  { dataField: 'Comm 2\n(pièce n°4 AO innovation)', visibility: ['admin'] },
  { dataField: 'Avis\n(pièce n°4 AO innovation)', visibility: ['admin'] },
  { dataField: 'Comm 1\n(pièce n°5 AO innovation)', visibility: ['admin'] },
  { dataField: 'Comm 2\n(pièce n°5 AO innovation)', visibility: ['admin'] },
  { dataField: 'Avis\n(pièce n°5 AO innovation)', visibility: ['admin'] },
  { dataField: "Type d'AU \n(pièce n°4)", visibility: ['admin'] },
  { dataField: 'Date \n(pièce n°4)', visibility: ['admin'] },
  { dataField: 'Comm 2 \n(pièce n°4)', visibility: ['admin'] },
  { dataField: 'Avis \n(pièce n°4)', visibility: ['admin'] },
  { dataField: 'Comm 1 \n(pièce n°6)', visibility: ['admin'] },
  { dataField: 'Comm 2 \n(pièce n°6)', visibility: ['admin'] },
  { dataField: 'Avis \n(pièce n°6)', visibility: ['admin'] },
  { dataField: 'Oui/non ? \n(pièce n°7)', visibility: ['admin'] },
  { dataField: 'Comm 1 \n(pièce n°7)', visibility: ['admin'] },
  { dataField: 'Comm 2 \n(pièce n°7)', visibility: ['admin'] },
  { dataField: 'Avis \n(pièce n°7)', visibility: ['admin'] },
  { dataField: 'Comm 1 \n(Délégation de signature)', visibility: ['admin'] },
  { dataField: 'Comm 2 \n(Délégation de signature)', visibility: ['admin'] },
  { dataField: 'Avis \n(Délégation de signature)', visibility: ['admin'] },
  { dataField: 'Commentaire final', visibility: ['admin'] },
  { dataField: 'Avis final', visibility: ['admin'] },
  { dataField: 'Avis final CRE + ADEME', visibility: ['admin'] },
  { dataField: 'Puissance cumulée', visibility: ['admin', 'dreal', 'acheteur-obligé'] },
  { dataField: 'classe', visibility: ['*'] },
  { dataField: 'Prix Majoré', visibility: ['admin', 'acheteur-obligé'] },
  { dataField: 'Codes cas\n(AO sol)', visibility: ['admin', 'dreal'] },
  { dataField: 'Codes cas 2\n(AO sol)', visibility: ['admin', 'dreal'] },
  { dataField: 'Codes cas 3\n(AO sol)', visibility: ['admin', 'dreal'] },
  { dataField: 'motifsElimination', visibility: ['*'] },
  { dataField: 'Nom projet (doublon)', visibility: ['admin', 'dreal'] },
  { dataField: 'CP (doublon)', visibility: ['admin', 'dreal'] },
  { dataField: 'Commune (doublon)', visibility: ['admin', 'dreal'] },
  { dataField: 'Modifications', visibility: ['*'] },
  { dataField: 'Statut', visibility: ['*'] },
  { dataField: 'notifiedOn', visibility: ['*'] },
  { dataField: 'Commentaires', visibility: ['admin', 'dreal'] },
  { dataField: 'Type de modification 1', visibility: ['*'] },
  { dataField: 'Date de modification 1', visibility: ['*'] },
  { dataField: 'Colonne concernée 1', visibility: ['*'] },
  { dataField: 'Ancienne valeur 1', visibility: ['*'] },
  { dataField: 'Type de modification 2', visibility: ['*'] },
  { dataField: 'Date de modification 2', visibility: ['*'] },
  { dataField: 'Colonne concernée 2', visibility: ['*'] },
  { dataField: 'Ancienne valeur 2', visibility: ['*'] },
  { dataField: 'Type de modification 3', visibility: ['*'] },
  { dataField: 'Date de modification 3', visibility: ['*'] },
  { dataField: 'Colonne concernée 3', visibility: ['*'] },
  { dataField: 'Ancienne valeur 3', visibility: ['*'] },
  { dataField: 'Type de modification 4', visibility: ['*'] },
  { dataField: 'Date de modification 4', visibility: ['*'] },
  { dataField: 'Colonne concernée 4', visibility: ['*'] },
  { dataField: 'Ancienne valeur 4', visibility: ['*'] },
  { dataField: 'Type de modification 5', visibility: ['*'] },
  { dataField: 'Date de modification 5', visibility: ['*'] },
  { dataField: 'Colonne concernée 5', visibility: ['*'] },
  { dataField: 'Ancienne valeur 5', visibility: ['*'] },
  { dataField: 'garantiesFinancieresDate', visibility: ['*'] },
  { dataField: 'garantiesFinancieresSubmittedOn', visibility: ['*'] },
]

const getProjectListCsv = asyncHandler(async (request, response) => {
  let {
    appelOffreId,
    periodeId,
    familleId,
    recherche,
    classement,
    garantiesFinancieres,
  } = request.query as any

  if (!request.user?.role) {
    return response.redirect(routes.LOGIN)
  }

  if (typeof classement === 'undefined') {
    classement = 'classés'
    request.query.classement = 'classés'
  }

  const defaultPagination: Pagination = {
    page: 0,
    pageSize: 1000000,
  }

  const pagination = makePagination(request.query, defaultPagination)

  if (!appelOffreId) {
    // Reset the periodId and familleId if there is no appelOffreId
    periodeId = undefined
    familleId = undefined
  }

  const {
    projects: { items: projects },
  } = await listProjects({
    user: request.user,
    appelOffreId,
    periodeId,
    familleId,
    pagination,
    recherche,
    classement,
    garantiesFinancieres,
  })

  try {
    const selectedFields = _selectFieldsForRole(request.user.role)

    _convertTimestampToFrenchDateFormat(projects)

    const csv = await parseAsync(projects, { fields: selectedFields, delimiter: ';' })

    const csvFilePath = await writeCsvOnDisk(csv, '/tmp')

    // Delete file when the client's download is complete
    response.on('finish', async () => {
      await fsPromises.unlink(csvFilePath)
    })

    return response.type('text/csv').sendFile(csvFilePath)
  } catch (error) {
    logger.error(error)
    return response
      .status(500)
      .send(
        "Un problème est survenu pendant la génération de l'export des projets en format csv. Veuillez contacter un administrateur."
      )
  }
})

function _convertTimestampToFrenchDateFormat(projects: Project[]): void {
  const timestampsFields = [
    'notifiedOn',
    'garantiesFinancieresSubmittedOn',
    'garantiesFinancieresDate',
  ]

  projects.forEach((project) => {
    Object.entries(project).forEach(([key, value]) => {
      if (timestampsFields.includes(key) && project[key] !== 0)
        project[key] = moment(Number(value)).format('DD/MM/YYYY')
    })
  })
}

function _selectFieldsForRole(userRole: string): { label: string; value: string | Function }[] {
  return orderedFields
    .filter((field) => field.visibility.includes(userRole) || field.visibility.includes('*'))
    .reduce((fields, field) => [...fields, formatField(field)], [])
}

v1Router.get(
  routes.DOWNLOAD_PROJECTS_CSV,
  ensureRole(['admin', 'dgec', 'dreal', 'porteur-projet', 'acheteur-obligé']),
  getProjectListCsv
)
