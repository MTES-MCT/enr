import { ProjectAppelOffre } from '../../../entities'

export type ProjectDataForProjectPage = {
  id: string

  appelOffre: ProjectAppelOffre

  appelOffreId: string
  periodeId: string
  familleId: string
  numeroCRE: string

  puissance: number
  prixReference?: number

  engagementFournitureDePuissanceAlaPointe: boolean
  isFinancementParticipatif: boolean
  isInvestissementParticipatif: boolean

  adresseProjet: string
  codePostalProjet: string
  communeProjet: string
  departementProjet: string
  regionProjet: string
  territoireProjet?: string

  nomCandidat: string
  nomProjet: string
  nomRepresentantLegal: string
  email: string
  fournisseur: string
  evaluationCarbone: number
  note: number

  details: Record<string, any>

  updatedAt?: Date
} & (IsNotified | IsNotNotified) &
  (IsClasse | IsElimine)

type IsNotNotified = {
  notifiedOn: undefined
}

type IsNotified = {
  notifiedOn: Date
  certificateFile?: {
    id: string
    filename: string
  }
} & Users &
  Invitations

type IsClasse = {
  isClasse: true
  completionDueOn: Date
} & GarantieFinanciere &
  DCR &
  PTF

type IsElimine = {
  isClasse: false
  motifsElimination: string
}

type DCR = { dcr: { dueOn: Date } & (DCRSubmitted | DCRPending) }

type DCRSubmitted = {
  submittedOn: Date
  dcrDate: Date
  file: {
    id: string
    filename: string
  }
  numeroDossier: string
}

type DCRPending = {
  submittedOn: undefined
}

type PTF = PTFSubmitted | PTFPending

type PTFSubmitted = {
  ptf: {
    submittedOn: Date
    ptfDate: Date
    file: {
      id: string
      filename: string
    }
  }
}

type PTFPending = {
  ptf: undefined
}

type GarantieFinanciere = RequiresGF | DoesNotRequireGF

type DoesNotRequireGF = {
  garantiesFinancieres: undefined
}

type RequiresGF = {
  garantiesFinancieres: {
    dueOn: Date
  } & (GFSubmitted | GFPending)
}

type GFSubmitted = {
  submittedOn: Date
  gfDate: Date
  file: {
    id: string
    filename: string
  }
}

type GFPending = {
  submittedOn: undefined
}

type Users = {
  users: Array<{
    id: string
    fullName: string
    email: string
  }>
}

type Invitations = {
  invitations: Array<{
    id: string
    email: string
  }>
}
