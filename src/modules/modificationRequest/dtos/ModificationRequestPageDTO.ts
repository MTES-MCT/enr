import { ModificationRequestStatusDTO } from './ModificationRequestListItemDTO'

export type ModificationRequestPageDTO = {
  id: string
  status: ModificationRequestStatusDTO

  respondedBy?: string
  respondedOn?: Date
  responseFile?: {
    filename: string
    id: string
  }

  versionDate: Date

  requestedOn: Date
  requestedBy: string

  justification: string
  attachmentFile: {
    filename: string
    id: string
  }

  project: {
    id: string
    numeroCRE: string
    nomProjet: string
    nomCandidat: string
    communeProjet: string
    departementProjet: string
    regionProjet: string
    puissance: number
    unitePuissance: string
    notifiedOn: Date
    completionDueOn: Date
    appelOffreId: string
    periodeId: string
    familleId: string | undefined
    numeroGestionnaire: string | undefined
  }
} & Variant

type Variant =
  | { type: 'actionnaire'; actionnaire: string }
  | { type: 'fournisseur'; fournisseur: string }
  | { type: 'producteur'; producteur: string }
  | { type: 'puissance'; puissance: number }
  | { type: 'recours' }
  | { type: 'abandon' }
  | { type: 'delai'; delayInMonths: number; acceptanceParams?: { delayInMonths: number } }
