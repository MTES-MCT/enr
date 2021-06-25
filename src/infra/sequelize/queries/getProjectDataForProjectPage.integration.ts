import models from '../models'
import { resetDatabase } from '../helpers'
import makeFakeProject from '../../../__tests__/fixtures/project'
import makeFakeUser from '../../../__tests__/fixtures/user'
import makeFakeFile from '../../../__tests__/fixtures/file'
import { UniqueEntityID } from '../../../core/domain'
import { makeGetProjectDataForProjectPage } from './getProjectDataForProjectPage'

const { Project, File, User, UserProjects, ProjectStep } = models
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
  completionDueOn: new Date(5678).getTime(),

  certificateFileId: certificateFileId,

  classe: 'Classé',
  motifsElimination: 'motifsElimination',
}

const user = makeFakeUser({ role: 'admin', id: new UniqueEntityID().toString() })

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
      completionDueOn: new Date(5678),

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
    const userId2 = new UniqueEntityID().toString()

    await resetDatabase()

    await Project.create(makeFakeProject(projectInfo))
    await User.create(
      makeFakeUser({
        id: userId,
        fullName: 'username',
        email: 'user@test.test',
        registeredOn: new Date(123),
      })
    )
    await User.create(
      makeFakeUser({
        id: userId2,
        fullName: 'username',
        email: 'user2@test.test',
      })
    )
    await UserProjects.create({
      userId,
      projectId,
    })
    await UserProjects.create({
      userId: userId2,
      projectId,
    })

    const res = await getProjectDataForProjectPage({ projectId, user })

    expect(res._unsafeUnwrap()).toMatchObject({
      users: [
        { id: userId, fullName: 'username', email: 'user@test.test', isRegistered: true },
        { id: userId2, fullName: 'username', email: 'user2@test.test', isRegistered: false },
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
          garantiesFinancieresDueOn: 34,
        })
      )
      await ProjectStep.create({
        id: new UniqueEntityID().toString(),
        projectId,
        type: 'garantie-financiere',
        submittedOn: new Date(345),
        submittedBy: new UniqueEntityID().toString(),
        stepDate: new Date(45),
        fileId: gfFileId,
      })
      await File.create(makeFakeFile({ id: certificateFileId, filename: 'filename' }))
      await File.create(makeFakeFile({ id: gfFileId, filename: 'filename' }))

      const res = await getProjectDataForProjectPage({ projectId, user })

      expect(res._unsafeUnwrap()).toMatchObject({
        garantiesFinancieres: {
          dueOn: new Date(34),
          gfDate: new Date(45),
          submittedOn: new Date(345),
          file: {
            id: gfFileId,
            filename: 'filename',
          },
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
      await ProjectStep.create({
        id: new UniqueEntityID().toString(),
        projectId,
        type: 'dcr',
        submittedOn: new Date(345),
        submittedBy: new UniqueEntityID().toString(),
        stepDate: new Date(45),
        details: {
          numeroDossier: 'numeroDossier',
        },
        fileId: dcrFileId,
      })
      await File.create(makeFakeFile({ id: certificateFileId, filename: 'filename' }))
      await File.create(makeFakeFile({ id: dcrFileId, filename: 'filename' }))

      const res = await getProjectDataForProjectPage({ projectId, user })

      expect(res._unsafeUnwrap()).toMatchObject({
        dcr: {
          submittedOn: new Date(345),
          dueOn: new Date(34),
          dcrDate: new Date(45),
          file: {
            id: dcrFileId,
            filename: 'filename',
          },
          numeroDossier: 'numeroDossier',
        },
      })
    })
  })

  describe('when ptf has been submitted', () => {
    const ptfFileId = new UniqueEntityID().toString()

    it('should include ptf info', async () => {
      await resetDatabase()

      await Project.create(makeFakeProject(projectInfo))
      await File.create(makeFakeFile({ id: certificateFileId, filename: 'filename' }))
      await File.create(makeFakeFile({ id: ptfFileId, filename: 'filename' }))
      await ProjectStep.create({
        id: new UniqueEntityID().toString(),
        type: 'ptf',
        projectId,
        stepDate: new Date(56),
        fileId: ptfFileId,
        submittedOn: new Date(567),
        submittedBy: user.id,
      })

      const res = await getProjectDataForProjectPage({ projectId, user })

      expect(res._unsafeUnwrap()).toMatchObject({
        ptf: {
          submittedOn: new Date(567),
          ptfDate: new Date(56),
          file: {
            id: ptfFileId,
            filename: 'filename',
          },
        },
      })
    })
  })

  describe('when user is dreal', () => {
    const user = makeFakeUser({ role: 'dreal' })

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
