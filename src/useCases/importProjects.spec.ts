import makeImportProjects, {
  ERREUR_AUCUNE_LIGNE,
  ERREUR_FORMAT_LIGNE,
  ERREUR_INSERTION,
} from './importProjects'
import _ from 'lodash'
import {
  makeProject,
  makeCredentials,
  makeUser,
  User,
  Project,
} from '../entities'
import {
  resetDatabase,
  projectRepo,
  appelOffreRepo,
  appelsOffreStatic,
} from '../dataAccess/inMemory'
import makeFakeProject from '../__tests__/fixtures/project'
import hashPassword from '../helpers/hashPassword'
import moment from 'moment'

const importProjects = makeImportProjects({ projectRepo, appelOffreRepo })

const phonyAppelOffre = appelsOffreStatic[0]
const phonyPeriodId = phonyAppelOffre.periodes[0].id
const phonyNumeroCRE = '1'
const phonyFamilleId = '1'
const phonyNotifiedOnDate = '22/04/2020'

const getColumnForField = (field: string) => {
  const dataField = phonyAppelOffre.dataFields.find(
    (item) => item.field === field
  )
  if (!dataField)
    console.log(
      'importProjects test, getColumnForField missing column for field',
      field
    )
  return dataField ? dataField.column : 'missing-' + field
}

const makePhonyLine = () => ({
  "Appel d'offres": phonyAppelOffre.id,
  Période: phonyPeriodId,
  [getColumnForField('numeroCRE')]: phonyNumeroCRE,
  [getColumnForField('familleId')]: phonyFamilleId,
  [getColumnForField('nomCandidat')]: 'nomCandidat',
  [getColumnForField('nomProjet')]: 'nomProjet',
  [getColumnForField('puissance')]: '11,5',
  [getColumnForField('prixReference')]: '100',
  [getColumnForField('evaluationCarbone')]: '142.5',
  [getColumnForField('note')]: '11',
  [getColumnForField('nomRepresentantLegal')]: 'nomRepresentantLegal',
  [getColumnForField('email')]: 'email@address.com',
  [getColumnForField('adresseProjet')]: 'adresseProjet',
  [getColumnForField('codePostalProjet')]: '01234',
  [getColumnForField('communeProjet')]: 'communeProjet',
  [getColumnForField('fournisseur')]: 'fournisseur',
  [getColumnForField('classe')]: 'Classé',
  [getColumnForField('motifsElimination')]: '',
  [getColumnForField('notifiedOn')]: phonyNotifiedOnDate,
})

describe('importProjects use-case', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  it('inserts all given projects to the store', async () => {
    const priorProjects = await projectRepo.findAll()

    expect(priorProjects).toHaveLength(0)

    const phonyLine = makePhonyLine()
    const result = await importProjects({
      lines: [phonyLine],
      userId: 'userId',
    })

    expect(result.is_ok()).toBeTruthy()

    if (result.is_err()) {
      console.log('importProject returned error', result.unwrap_err())
      return
    }

    const newProjects = await projectRepo.findAll()

    // What is expected is the same as the phonyLine
    // but with numbers instead of strings
    // and project entity property names
    const expectedLine = {
      appelOffreId: phonyAppelOffre.id,
      periodeId: phonyPeriodId,
      numeroCRE: phonyNumeroCRE,
      familleId: phonyFamilleId,
      nomCandidat: 'nomCandidat',
      nomProjet: 'nomProjet',
      puissance: 11.5,
      prixReference: 100,
      evaluationCarbone: 142.5,
      note: 11,
      nomRepresentantLegal: 'nomRepresentantLegal',
      email: 'email@address.com',
      adresseProjet: 'adresseProjet',
      codePostalProjet: '01234',
      communeProjet: 'communeProjet',
      fournisseur: 'fournisseur',
      classe: 'Classé',
      motifsElimination: '',
      notifiedOn: moment(phonyNotifiedOnDate, 'DD/MM/YYYY').toDate().getTime(),
    }

    expect(newProjects).toHaveLength(1)

    for (const key in expectedLine) {
      expect(newProjects[0][key]).toEqual(expectedLine[key])
    }

    // Make sure a history item has been created
    const newProjectRes = await projectRepo.findById(newProjects[0].id, true)
    expect(newProjectRes.is_some()).toBe(true)
    if (newProjectRes.is_none()) return
    const newProject = newProjectRes.unwrap()

    expect(newProject.history).toHaveLength(1)
    if (!newProject.history || !newProject.history.length) return
    expect(newProject.history[0].before).toEqual({})
    expect(newProject.history[0].after).toEqual({})
    expect(newProject.history[0].type).toEqual('import')
    expect(newProject.history[0].userId).toEqual('userId')
    expect(newProject.history[0].createdAt / 100).toBeCloseTo(
      Date.now() / 100,
      0
    )
  })

  it('should override a project line if it has the same numeroCRE, appelOffreId, periodeId and familleId, except the notifiedOn field', async () => {
    // Create a fake project
    const insertedProjects = (
      await Promise.all(
        [
          makeFakeProject({
            appelOffreId: phonyAppelOffre.id,
            periodeId: phonyPeriodId,
            numeroCRE: phonyNumeroCRE,
            familleId: phonyFamilleId,
            nomProjet: 'Ancien nom projet',
            notifiedOn: 0,
          }),
        ]
          .map(makeProject)
          .filter((item) => item.is_ok())
          .map((item) => item.unwrap())
          .map(projectRepo.save)
      )
    )
      .filter((item) => item.is_ok())
      .map((item) => item.unwrap())

    expect(insertedProjects).toHaveLength(1)
    const oldProject = insertedProjects[0]
    if (!oldProject) return

    // Insert line through import
    const phonyLine = makePhonyLine()
    const result = await importProjects({
      lines: [phonyLine],
      userId: 'userId',
    })

    expect(result.is_ok()).toBeTruthy()

    // Make sure there's only one project in the database
    const allProjects = await projectRepo.findAll()
    expect(allProjects).toHaveLength(1)

    // Make sure the project has been updated
    const updatedProjectRes = await projectRepo.findById(oldProject.id, true)
    expect(updatedProjectRes.is_some()).toBe(true)
    if (updatedProjectRes.is_none()) return
    const updatedProject = updatedProjectRes.unwrap()

    expect(updatedProject.nomProjet).toEqual('nomProjet')
    expect(updatedProject.notifiedOn).toEqual(0)

    // Make sure a history event has been added
    expect(updatedProject.history).toHaveLength(1)
    if (!updatedProject.history || !updatedProject.history.length) return
    expect(updatedProject.history[0].before.nomProjet).toEqual(
      'Ancien nom projet'
    )
    expect(updatedProject.history[0].after.nomProjet).toEqual('nomProjet')
    expect(updatedProject.history[0].type).toEqual('import')
    expect(updatedProject.history[0].userId).toEqual('userId')
    expect(updatedProject.history[0].createdAt / 100).toBeCloseTo(
      Date.now() / 100,
      0
    )
  })

  it("should throw an error if there isn't at least one line", async () => {
    const result = await importProjects({
      lines: [],
      userId: 'userId',
    })

    expect(result.is_err())
    expect(result.unwrap_err().message).toEqual(ERREUR_AUCUNE_LIGNE)
  })

  it("should throw an error if some lines don't have the required fields", async () => {
    const goodLine = makePhonyLine()
    // create a bad line by removing a required field
    const badLine = _.omit(goodLine, getColumnForField('nomCandidat'))

    const result = await importProjects({
      lines: [goodLine, badLine],
      userId: 'userId',
    })

    expect(result.is_err())
    expect(result.unwrap_err().message.indexOf(ERREUR_FORMAT_LIGNE)).toEqual(0)
  })
})
