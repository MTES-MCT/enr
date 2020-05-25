import isEmail from 'isemail'
import {
  String,
  Number,
  Record,
  Array as SchemaArray,
  Union,
  Literal,
  Boolean,
  Static,
  Unknown,
  Partial as SchemaPartial,
  Undefined,
} from '../types/schemaTypes'
import buildMakeEntity from '../helpers/buildMakeEntity'

import { User, ModificationRequest } from './'

import { candidateNotificationSchema } from './candidateNotification'
import { appelOffreSchema } from './appelOffre'

const territoireSchema = Union(
  Literal('Corse'),
  Literal('Guadeloupe'),
  Literal('Guyane'),
  Literal('La Réunion'),
  Literal('Mayotte'),
  Literal('Martinique')
)

const baseProjectSchema = Record({
  id: String,
  appelOffreId: String,
  periodeId: String,
  numeroCRE: String,
  familleId: String,
  nomCandidat: String,
  nomProjet: String,
  puissance: Number.withConstraint((value) => value > 0),
  prixReference: Number.withConstraint((value) => value > 0),
  evaluationCarbone: Number,
  note: Number.withConstraint((value) => value >= 0),
  nomRepresentantLegal: String,
  isFinancementParticipatif: Boolean,
  isInvestissementParticipatif: Boolean,
  engagementFournitureDePuissanceAlaPointe: Boolean,
  email: String.withConstraint(isEmail.validate),
  adresseProjet: String,
  codePostalProjet: String,
  communeProjet: String,
  departementProjet: String,
  regionProjet: String,
  fournisseur: String,
  classe: Union(Literal('Eliminé'), Literal('Classé')),
  motifsElimination: String,
  notifiedOn: Number,
  garantiesFinancieresSubmittedOn: Number,
  garantiesFinancieresSubmittedBy: String,
  garantiesFinancieresFile: String,
  garantiesFinancieresDate: Number,
})
const projectSchema = baseProjectSchema.And(
  SchemaPartial({
    candidateNotifications: SchemaArray(candidateNotificationSchema).Or(
      Undefined
    ),
    actionnaire: String,
    territoireProjet: territoireSchema.Or(Undefined),
    appelOffre: appelOffreSchema,
  })
)

const fields: string[] = [
  'candidateNotifications',
  'actionnaire',
  'territoireProjet',
  'appelOffre',
  'history',
  ...Object.keys(baseProjectSchema.fields),
]

type BaseProject = Static<typeof projectSchema>

type ProjectEvent = {
  before: Partial<BaseProject>
  after: Partial<BaseProject>
  createdAt: number
  userId: User['id']
  type:
    | 'modification-request'
    | 'import'
    | 'candidate-notification'
    | 'garanties-financieres-submission'
  modificationRequestId?: ModificationRequest['id']
  isNew?: true
}

type Project = BaseProject & {
  history?: Array<ProjectEvent>
}

interface ApplyProjectUpdateProps {
  project: Project
  update?: Partial<BaseProject>
  context: {
    userId: User['id']
    type: ProjectEvent['type']
    modificationRequestId?: ModificationRequest['id']
  }
}
function applyProjectUpdate({
  project,
  update,
  context,
}: ApplyProjectUpdateProps): Project {
  // Determine before/after values from the project and update
  const { before, after } = update
    ? Object.keys(update)
        .filter(
          (key) =>
            key !== 'id' &&
            // Only accept changes to notifiedOn for candidate-notifications
            (context.type === 'candidate-notification' || key !== 'notifiedOn')
        )
        .reduce(
          ({ before, after }, key: string) => {
            if (project[key] != update[key]) {
              before[key] = project[key]
              after[key] = update[key]

              // Update the project itself
              project[key] = update[key]
            }
            return { before, after }
          },
          {
            before: {} as Partial<BaseProject>,
            after: {} as Partial<BaseProject>,
          }
        )
    : // If no update is defined, the whole project is new, consider the delta as empty
      { before: {}, after: {} }

  // Add a ProjectEvent to project.history
  project.history = [
    ...(project.history || []),
    {
      before,
      after,
      ...context,
      createdAt: Date.now(),
      isNew: true,
    },
  ]

  return project
}

interface MakeProjectDependencies {
  makeId: () => string
}

export default ({ makeId }: MakeProjectDependencies) =>
  buildMakeEntity<Project>(projectSchema, makeId, fields, {
    notifiedOn: 0,
    isInvestissementParticipatif: false,
    isFinancementParticipatif: false,
    engagementFournitureDePuissanceAlaPointe: false,
    garantiesFinancieresSubmittedOn: 0,
    garantiesFinancieresSubmittedBy: '',
    garantiesFinancieresFile: '',
    garantiesFinancieresDate: 0,
  })

export {
  Project,
  ProjectEvent,
  projectSchema,
  territoireSchema,
  applyProjectUpdate,
}
