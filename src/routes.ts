import { Project, makeProjectIdentifier } from './entities'
import querystring from 'querystring'
import sanitize from 'sanitize-filename'
import { makeCertificateFilename } from './modules/project/utils'

const withParams = <T extends Record<string, any>>(url: string) => (params?: T) => {
  if (!params) return url

  let priorQuery = {}
  if (url.indexOf('?') > -1) {
    priorQuery = querystring.parse(url.substring(url.indexOf('?') + 1))
  }

  const newQueryString = querystring.stringify({ ...priorQuery, ...params })

  return (
    (url.indexOf('?') === -1 ? url : url.substring(0, url.indexOf('?'))) +
    (newQueryString.length ? '?' + newQueryString.toString() : '')
  )
}

const withProjectId = (url: string) => (projectId: Project['id']) => withParams(url)({ projectId })

export { withParams }

class routes {
  static HOME = '/'
  static LOGIN = '/login.html'
  static STATS = '/stats.html'
  static LOGOUT_ACTION = '/logout'

  static REDIRECT_BASED_ON_ROLE = '/go-to-user-dashboard'
  static ADMIN_DASHBOARD = '/admin/dashboard.html'

  static ADMIN_AO_PERIODE = '/admin/appels-offres.html'
  static IMPORT_AO_ACTION = '/admin/importAppelsOffres'
  static IMPORT_PERIODE_ACTION = '/admin/importPeriodes'
  static EXPORT_AO_CSV = '/admin/appelsOffres.csv'
  static EXPORT_PERIODE_CSV = '/admin/periodes.csv'

  static ADMIN_USERS = '/admin/utilisateurs.html'
  static ADMIN_INVITE_USER_ACTION = '/admin/inviterUtilisateur'

  static USER_INVITATION = '/enregistrement.html'

  static IMPORT_PROJECTS = '/admin/importer-candidats.html' // Keep separate from ADMIN_DASHBOARD, may change

  static PROJECT_DETAILS = (projectId?: Project['id']) => {
    const route = '/projet/:projectId/details.html'
    if (projectId) {
      return route.replace(':projectId', projectId)
    } else return route
  }

  static DOWNLOAD_PROJECTS_CSV = '/export-projets.csv'
  static ADMIN_DOWNLOAD_PROJECTS_LAUREATS_CSV = '/export-projets-laureats.csv'
  static IMPORT_PROJECTS_ACTION = '/admin/importProjects'
  static ADMIN_LIST_PROJECTS = '/admin/dashboard.html'
  static ADMIN_LIST_REQUESTS = '/admin/demandes.html'
  static ADMIN_REGENERATE_CERTIFICATES = '/admin/regenerer-attestations.html'
  static ADMIN_REGENERATE_CERTIFICATES_ACTION = '/admin/regenerer-attestations'
  static ADMIN_NOTIFY_CANDIDATES = withParams<{
    appelOffreId: string
    periodeId: string
  }>('/admin/notifier-candidats.html')

  static PREVIEW_CANDIDATE_CERTIFICATE = (project?: {
    id: string
    certificateFile?: {
      id: string
      filename: string
    }
    appelOffreId: string
    periodeId: string
    familleId: string | undefined
    numeroCRE: string
    email: string
    nomProjet: string
  }) => {
    const route = '/previsualiser-attestation/:projectId/*'
    if (project) {
      return route
        .replace(':projectId', project.id)
        .replace('*', 'aperçu-' + makeCertificateFilename(project, true))
    } else return route
  }

  static DOWNLOAD_CERTIFICATE_FILE = (projectId?: string, fileId?: string, filename?: string) => {
    const route = '/attestation/:projectId/:fileId/:filename'
    if (projectId && fileId && filename) {
      return route
        .replace(':projectId', projectId)
        .replace(':fileId', fileId)
        .replace(':filename', filename)
    } else return route
  }

  static CANDIDATE_CERTIFICATE_FOR_ADMINS = (project: {
    id: string
    certificateFile?: {
      id: string
      filename: string
    }
    appelOffreId: string
    periodeId: string
    familleId: string | undefined
    numeroCRE: string
    email: string
    nomProjet: string
  }) =>
    routes.DOWNLOAD_CERTIFICATE_FILE(
      project.id,
      project.certificateFile?.id,
      makeCertificateFilename(project, true)
    )

  static CANDIDATE_CERTIFICATE_FOR_CANDIDATES = (project: {
    id: string
    certificateFile?: {
      id: string
      filename: string
    }
    appelOffreId: string
    periodeId: string
    familleId: string | undefined
    numeroCRE: string
    email: string
    nomProjet: string
  }) =>
    routes.DOWNLOAD_CERTIFICATE_FILE(
      project.id,
      project.certificateFile?.id,
      makeCertificateFilename(project)
    )

  static ADMIN_NOTIFY_CANDIDATES_ACTION = '/admin/sendCandidateNotifications'
  static ADMIN_CORRECT_PROJECT_DATA_ACTION = '/admin/correctProjectData'
  static ADMIN_REPLY_TO_MODIFICATION_REQUEST = '/admin/replyToModificationRequest'

  static ADMIN_DREAL_LIST = '/admin/dreals.html'
  static ADMIN_INVITATION_LIST = '/admin/invitations.html'
  static ADMIN_INVITATION_RELANCE_ACTION = '/admin/relanceInvitations'
  static ADMIN_NOTIFICATION_LIST = '/admin/notifications.html'
  static ADMIN_NOTIFICATION_RETRY_ACTION = '/admin/retryNotifications'

  static SUCCESS_PAGE = withParams<{
    success: string
    redirectUrl: string
    redirectTitle: string
  }>('/confirmation.html')

  static USER_DASHBOARD = '/mes-projets.html'
  static USER_LIST_PROJECTS = '/mes-projets.html'
  static USER_LIST_REQUESTS = '/mes-demandes.html'
  static DEMANDE_GENERIQUE = '/demande-modification.html'
  static DEPOSER_RECOURS = withProjectId('/demande-modification.html?action=recours')

  static DEMANDE_DELAIS = withProjectId('/demande-modification.html?action=delai')

  static CHANGER_FOURNISSEUR = withProjectId('/demande-modification.html?action=fournisseur')

  static CHANGER_ACTIONNAIRE = withProjectId('/demande-modification.html?action=actionnaire')

  static CHANGER_PUISSANCE = withProjectId('/demande-modification.html?action=puissance')

  static CHANGER_PRODUCTEUR = withProjectId('/demande-modification.html?action=producteur')

  static DEMANDER_ABANDON = withProjectId('/demande-modification.html?action=abandon')

  static DEMANDE_ACTION = '/soumettre-demande'

  static CONFIRMER_DEMANDE_ACTION = '/confirmer-demande'

  static ANNULER_DEMANDE_ACTION = '/annuler-demande'

  static DOWNLOAD_PROJECT_FILE = (fileId?: string, filename?: string) => {
    const route = '/telechargement/:fileId/fichier/:filename'
    if (fileId && filename) {
      return route.replace(':fileId', fileId).replace(':filename', filename)
    } else return route
  }

  static DEMANDE_PAGE_DETAILS = (modificationRequestId?: string) => {
    const route = '/demande/:modificationRequestId/details.html'
    if (modificationRequestId) {
      return route.replace(':modificationRequestId', modificationRequestId)
    } else return route
  }

  static INVITE_USER_TO_PROJECT_ACTION = '/invite-user-to-project'

  static DEPOSER_ETAPE_ACTION = '/deposer-etape'
  static SUPPRIMER_ETAPE_ACTION = (args?: { projectId: string; type: string }) => {
    const route = '/projet/:projectId/supprimer/:type'
    if (args) {
      const { type, projectId } = args
      return route.replace(':projectId', projectId).replace(':type', type)
    } else return route
  }

  static UPDATE_PROJECT_STEP_STATUS = (args?: {
    projectId: string
    newStatus: 'à traiter' | 'validé'
    projectStepId: string
  }) => {
    const route = '/projet/:projectId/etape-projet/:projectStepId/statut/:newStatus'

    if (args) {
      const { newStatus, projectId, projectStepId } = args
      return route
        .replace(':projectId', projectId)
        .replace(':newStatus', newStatus)
        .replace(':projectStepId', projectStepId)
    }

    return route
  }

  static TELECHARGER_MODELE_MISE_EN_DEMEURE = (project?: { id: string; nomProjet: string }) => {
    const route = '/projet/:projectId/telecharger-mise-en-demeure/:filename'
    if (project) {
      return route
        .replace(':projectId', project.id)
        .replace(
          ':filename',
          sanitize(`Mise en demeure Garanties Financières - ${project.nomProjet}.docx`)
        )
    } else return route
  }

  static TELECHARGER_MODELE_REPONSE = (project?: Project, modificationRequestId?: string) => {
    const route = '/projet/:projectId/demande/:modificationRequestId/telecharger-reponse/:filename'
    if (project && modificationRequestId) {
      const now = new Date()
      return route
        .replace(':projectId', project.id)
        .replace(':modificationRequestId', modificationRequestId)
        .replace(
          ':filename',
          sanitize(
            `${now.getFullYear()}-${
              now.getMonth() + 1
            }-${now.getDate()} - Réponse demande - ${makeProjectIdentifier(project)}.docx`
          )
        )
    } else return route
  }

  static REVOKE_USER_RIGHTS_TO_PROJECT_ACTION = withParams<{
    projectId: string
    userId: string
  }>('/retirer-droits')
}

export default routes
