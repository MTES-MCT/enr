import models from '../models'
import { resetDatabase } from '../helpers'
import makeFakeProject from '../../../__tests__/fixtures/project'
import makeFakeUser from '../../../__tests__/fixtures/user'
import makeFakeFile from '../../../__tests__/fixtures/file'
import { makeUser } from '../../../entities'
import { UniqueEntityID } from '../../../core/domain'
import { makeGetProjectDataForProjectPage } from './getProjectDataForProjectPage'

const { Project, File, User, UserProjects, ProjectAdmissionKey } = models
const certificateFileId = new UniqueEntityID().toString()

const projectId = new UniqueEntityID().toString()
const projectInfo = {
  id: projectId,
  numeroCRE: 'numeroCRE',
  nomProjet: 'nomProjet',
  nomCandidat: 'nomCandidat',
  adresseProjet: 'adresse',
  codePostalProjet: '12345',
  communeProjet: 'communeProjet',
  departementProjet: 'departementProjet',
  regionProjet: 'regionProjet',
  territoireProjet: 'territoireProjet',
  puissance: 123,
  prixReference: 456,
  appelOffreId: 'Fessenheim',
  periodeId: '1',
  familleId: 'familleId',
  engagementFournitureDePuissanceAlaPointe: false,
  isFinancementParticipatif: false,
  isInvestissementParticipatif: true,
  nomRepresentantLegal: 'representantLegal',
  email: 'test@test.test',
  fournisseur: 'fournisseur',
  evaluationCarbone: 132,
  note: 10,

  details: {
    detail1: 'valeurDetail1',
  },

  notifiedOn: new Date(321).getTime(),

  certificateFileId: certificateFileId,

  classe: 'Classé',
  motifsElimination: 'motifsElimination',
}

const user = makeUser(makeFakeUser({ role: 'admin' })).unwrap()

describe('Sequelize getProjectDataForProjectPage', () => {
  const getProjectDataForProjectPage = makeGetProjectDataForProjectPage(models)

  it('should return a ProjectDataForProjectPage dto', async () => {
    await resetDatabase()

    await Project.create(makeFakeProject(projectInfo))
    await File.create(makeFakeFile({ id: certificateFileId, filename: 'filename' }))

    const res = (await getProjectDataForProjectPage({ projectId, user }))._unsafeUnwrap()

    expect(res).toMatchObject({
      id: projectId,

      appelOffreId: 'Fessenheim',
      periodeId: '1',
      familleId: 'familleId',
      numeroCRE: 'numeroCRE',

      puissance: 123,
      prixReference: 456,

      engagementFournitureDePuissanceAlaPointe: false,
      isFinancementParticipatif: false,
      isInvestissementParticipatif: true,

      adresseProjet: 'adresse',
      codePostalProjet: '12345',
      communeProjet: 'communeProjet',
      departementProjet: 'departementProjet',
      regionProjet: 'regionProjet',
      territoireProjet: 'territoireProjet',

      nomProjet: 'nomProjet',
      nomCandidat: 'nomCandidat',
      nomRepresentantLegal: 'representantLegal',
      email: 'test@test.test',
      fournisseur: 'fournisseur',
      evaluationCarbone: 132,
      note: 10,

      details: {
        detail1: 'valeurDetail1',
      },

      notifiedOn: new Date(321),

      certificateFile: {
        id: certificateFileId,
        filename: 'filename',
      },

      isClasse: true,

      motifsElimination: 'motifsElimination',
    })

    expect(res).not.toHaveProperty([
      'garantiesFinancieresSubmittedOn',
      'garantiesFinancieresDueOn',
      'garantiesFinancieresDate',
      'garantiesFinancieresFile',
    ])

    expect(res).not.toHaveProperty([
      'dcrSubmittedOn',
      'dcrDueOn',
      'dcrDate',
      'dcrFile',
      'dcrNumeroDossier',
    ])
  })

  it('should include a list of users that have access to this project', async () => {
    const userId = new UniqueEntityID().toString()

    await resetDatabase()

    await Project.create(makeFakeProject(projectInfo))
    await User.create(makeFakeUser({ id: userId, fullName: 'username', email: 'user@test.test' }))
    await UserProjects.create({
      userId,
      projectId,
    })

    const res = await getProjectDataForProjectPage({ projectId, user })

    expect(res._unsafeUnwrap()).toMatchObject({
      users: [{ id: userId, fullName: 'username', email: 'user@test.test' }],
    })
  })

  it('should include a list of pending invitations to this project', async () => {
    const invitationId1 = new UniqueEntityID().toString()
    const invitationId2 = new UniqueEntityID().toString()

    await resetDatabase()

    await Project.create(makeFakeProject(projectInfo))
    await ProjectAdmissionKey.bulkCreate([
      {
        id: invitationId1,
        projectId,
        email: 'invitation@test.test',
        fullName: '',
        lastUsedAt: 0,
        cancelled: false,
      },
      {
        // Invitation for project but already used
        id: new UniqueEntityID().toString(),
        projectId,
        email: 'other@test.test',
        fullName: '',
        lastUsedAt: 1,
      },
      {
        // Invitation for project but cancelled
        id: new UniqueEntityID().toString(),
        projectId,
        email: 'other@test.test',
        fullName: '',
        cancelled: true,
      },
      {
        // Invitation for project email
        id: invitationId2,
        email: 'test@test.test',
        fullName: '',
        lastUsedAt: 0,
        cancelled: false,
      },
      {
        // Invitation for project email but already used
        id: new UniqueEntityID().toString(),
        email: 'test@test.test',
        fullName: '',
        lastUsedAt: 1,
        cancelled: false,
      },
      {
        // Invitation for project email but cancelled
        id: new UniqueEntityID().toString(),
        email: 'test@test.test',
        fullName: '',
        lastUsedAt: 0,
        cancelled: true,
      },
    ])

    const res = await getProjectDataForProjectPage({ projectId, user })

    expect(res._unsafeUnwrap()).toMatchObject({
      invitations: [
        { id: invitationId1, email: 'invitation@test.test' },
        { id: invitationId2, email: 'test@test.test' },
      ],
    })
  })

  describe('when garantie financiere has been submitted', () => {
    const gfFileId = new UniqueEntityID().toString()

    it('should include garantie financiere info', async () => {
      await resetDatabase()

      await Project.create(
        makeFakeProject({
          ...projectInfo,
          garantiesFinancieresSubmittedOn: 345,
          garantiesFinancieresDueOn: 34,
          garantiesFinancieresDate: 45,
          garantiesFinancieresFileId: gfFileId,
        })
      )
      await File.create(makeFakeFile({ id: certificateFileId, filename: 'filename' }))
      await File.create(makeFakeFile({ id: gfFileId, filename: 'filename' }))

      const res = await getProjectDataForProjectPage({ projectId, user })

      expect(res._unsafeUnwrap()).toMatchObject({
        garantiesFinancieresSubmittedOn: new Date(345),
        garantiesFinancieresDueOn: new Date(34),
        garantiesFinancieresDate: new Date(45),
        garantiesFinancieresFile: {
          id: gfFileId,
          filename: 'filename',
        },
      })
    })
  })

  describe('when dcr has been submitted', () => {
    const dcrFileId = new UniqueEntityID().toString()

    it('should include dcr info', async () => {
      await resetDatabase()

      await Project.create(
        makeFakeProject({
          ...projectInfo,
          dcrSubmittedOn: 345,
          dcrDueOn: 34,
          dcrDate: 45,
          dcrFileId: dcrFileId,
          dcrNumeroDossier: 'numeroDossier',
        })
      )
      await File.create(makeFakeFile({ id: certificateFileId, filename: 'filename' }))
      await File.create(makeFakeFile({ id: dcrFileId, filename: 'filename' }))

      const res = await getProjectDataForProjectPage({ projectId, user })

      expect(res._unsafeUnwrap()).toMatchObject({
        dcrSubmittedOn: new Date(345),
        dcrDueOn: new Date(34),
        dcrDate: new Date(45),
        dcrFile: {
          id: dcrFileId,
          filename: 'filename',
        },
        dcrNumeroDossier: 'numeroDossier',
      })
    })
  })

  describe('when user is dreal', () => {
    const user = makeUser(makeFakeUser({ role: 'dreal' })).unwrap()

    beforeAll(async () => {
      await resetDatabase()

      await Project.create(makeFakeProject(projectInfo))
      await File.create(makeFakeFile({ id: certificateFileId, filename: 'filename' }))
    })

    it('should not include the prixReference', async () => {
      const res = (await getProjectDataForProjectPage({ projectId, user }))._unsafeUnwrap()

      expect(res).not.toHaveProperty('prixReference')
    })
    it('should not include the certificate', async () => {
      const res = (await getProjectDataForProjectPage({ projectId, user }))._unsafeUnwrap()

      expect(res).not.toHaveProperty('certificateFile')
    })
  })
})