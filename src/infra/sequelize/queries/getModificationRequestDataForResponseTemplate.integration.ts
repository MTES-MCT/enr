import models from '../models'
import { resetDatabase } from '../helpers'
import makeFakeProject from '../../../__tests__/fixtures/project'
import makeFakeFile from '../../../__tests__/fixtures/file'
import makeFakeUser from '../../../__tests__/fixtures/user'
import { makeGetModificationRequestDataForResponseTemplate } from './getModificationRequestDataForResponseTemplate'
import { UniqueEntityID } from '../../../core/domain'
import { makeProjectIdentifier, makeUser } from '../../../entities'
import { formatDate } from '../../../helpers/formatDate'
import moment from 'moment'
import { okAsync } from 'neverthrow'

describe('Sequelize getModificationRequestDataForResponseTemplate', () => {
  const getModificationRequestDataForResponseTemplate = makeGetModificationRequestDataForResponseTemplate(
    {
      models,
      getPeriode: jest.fn((appelOffreId: string, periodeId: string) =>
        okAsync({
          appelOffreId,
          periodeId,
          'Référence du paragraphe dédié à l’engagement de réalisation ou aux modalités d’abandon':
            'referenceParagrapheAbandon',
          'Dispositions liées à l’engagement de réalisation ou aux modalités d’abandon':
            'contenuParagrapheAbandon',
        })
      ),
    }
  )

  const { Project, ModificationRequest, User, File } = models

  const projectId = new UniqueEntityID().toString()
  const fileId = new UniqueEntityID().toString()
  const modificationRequestId = new UniqueEntityID().toString()
  const userId = new UniqueEntityID().toString()
  const userId2 = new UniqueEntityID().toString()

  const fakeAdminUser = makeUser(makeFakeUser({ role: 'admin', fullName: 'John Doe' })).unwrap()

  const versionDate = new Date(123)

  const projectInfo = {
    id: projectId,
    numeroCRE: 'numeroCRE',
    nomProjet: 'nomProjet',
    nomCandidat: 'nomCandidat',
    communeProjet: 'communeProjet',
    codePostalProjet: 'codePostalProjet',
    departementProjet: 'departementProjet',
    email: 'email',
    regionProjet: 'regionProjet',
    puissance: 123,
    notifiedOn: 321,
    appelOffreId: 'Fessenheim',
    periodeId: '1',
    familleId: '1',
    nomRepresentantLegal: 'nomRepresentantLegal',
    prixReference: 456,
    evaluationCarbone: 345,
    details: {
      'Adresse postale du contact': 'adresse postale',
    },
    completionDueOn: 8910,
    motifElimination: 'Non instruit: blabla',
  }

  const project = makeFakeProject(projectInfo)

  describe('in general', () => {
    beforeAll(async () => {
      // Create the tables and remove all data
      await resetDatabase()

      await Project.create(project)

      await File.create(makeFakeFile({ id: fileId, filename: 'filename' }))

      await User.create(makeFakeUser({ id: userId, fullName: 'John Doe' }))

      await ModificationRequest.create({
        id: modificationRequestId,
        projectId,
        userId,
        fileId,
        type: 'recours',
        requestedOn: 123,
        respondedOn: 321,
        respondedBy: userId2,
        status: 'envoyée',
        justification: 'justification',
        versionDate,
      })
    })

    it('should return generic modification request info fields', async () => {
      const modificationRequestResult = await getModificationRequestDataForResponseTemplate(
        modificationRequestId.toString(),
        fakeAdminUser
      )

      expect(modificationRequestResult.isOk()).toBe(true)
      if (modificationRequestResult.isErr()) return

      const modificationRequestDTO = modificationRequestResult.value

      expect(modificationRequestDTO).toMatchObject({
        suiviPar: 'John Doe',
        refPotentiel: makeProjectIdentifier(project),

        status: 'envoyée',

        nomRepresentantLegal: 'nomRepresentantLegal',
        nomCandidat: 'nomCandidat',
        adresseCandidat: 'adresse postale',
        email: 'email',

        titrePeriode: 'première',
        titreAppelOffre:
          '2019/S 019-040037 portant sur la réalisation et l’exploitation d’Installations de production d’électricité à partir de l’énergie solaire « transition énergétique du territoire de Fessenheim »',
        familles: 'yes',
        titreFamille: '1',

        nomProjet: 'nomProjet',
        puissance: '123',
        codePostalProjet: 'codePostalProjet',
        communeProjet: 'communeProjet',
        unitePuissance: 'MWc',

        dateDemande: '01/01/1970',
        justificationDemande: 'justification',
      })
    })
  })

  describe('when type is delai', () => {
    describe('when first delai request for this project', () => {
      beforeAll(async () => {
        // Create the tables and remove all data
        await resetDatabase()

        await Project.create(project)

        await File.create(makeFakeFile({ id: fileId, filename: 'filename' }))

        await User.create(makeFakeUser({ id: userId, fullName: 'John Doe' }))

        await ModificationRequest.create({
          id: modificationRequestId,
          projectId,
          userId,
          fileId,
          type: 'delai',
          requestedOn: 123,
          respondedOn: 321,
          respondedBy: userId2,
          status: 'envoyée',
          justification: 'justification',
          versionDate,
          delayInMonths: 2,
        })
      })

      it('should return delai specific modification request info fields', async () => {
        const modificationRequestResult = await getModificationRequestDataForResponseTemplate(
          modificationRequestId.toString(),
          fakeAdminUser
        )

        expect(modificationRequestResult.isOk()).toBe(true)
        if (modificationRequestResult.isErr()) return

        const modificationRequestDTO = modificationRequestResult.value

        expect(modificationRequestDTO).toMatchObject({
          type: 'delai',
          referenceParagrapheAchevement: '6.4',
          contenuParagrapheAchevement: `Le Candidat dont l’offre a été retenue s’engage à ce que l’Achèvement de son Installation intervienne avant une limite définie par la date la plus tardive des deux dates suivantes :
- 24 mois à compter de la Date de désignation.
- deux mois à compter de la fin des travaux de raccordement, sous réserve que le Producteur puisse justifier qu’il a déposé sa demande de raccordement dans les deux (2) mois suivant la Date de désignation et mis en œuvre toutes les démarches dans le respect des exigences du gestionnaire de réseau pour que les travaux de raccordement soient réalisés dans les délais. Dans ce cas, l’attestation de conformité doit intervenir dans un délai de 2 mois à compter de la fin des travaux de raccordement matérialisée par la date d’envoi par le gestionnaire de réseau compétent de la facture de solde à acquitter par le producteur pour sa contribution au coût du raccordement.
En cas de dépassement de ce délai, la durée de contrat mentionnée au 7.1.1 est réduite de la durée de dépassement.`,
          dateLimiteAchevementInitiale: formatDate(+moment(321).add(24, 'months')),
          dateLimiteAchevementActuelle: formatDate(8910),
          dateNotification: formatDate(321),
          dureeDelaiDemandeEnMois: '2',
        })
      })
    })

    describe('when another delai request has been granted for this project', () => {
      beforeAll(async () => {
        // Create the tables and remove all data
        await resetDatabase()

        await Project.create(project)

        await File.create(makeFakeFile({ id: fileId, filename: 'filename' }))

        await User.create(makeFakeUser({ id: userId, fullName: 'John Doe' }))

        await ModificationRequest.create({
          id: modificationRequestId,
          projectId,
          userId,
          fileId,
          type: 'delai',
          requestedOn: 123,
          respondedOn: 321,
          respondedBy: userId2,
          status: 'envoyée',
          justification: 'justification',
          versionDate,
          delayInMonths: 2,
        })

        // Add a previous request that is accepted
        await ModificationRequest.create({
          id: new UniqueEntityID().toString(),
          projectId,
          userId,
          fileId,
          type: 'delai',
          requestedOn: 789,
          respondedOn: 897,
          respondedBy: userId2,
          status: 'acceptée',
          justification: 'justification',
          versionDate,
          delayInMonths: 4,
          acceptanceParams: {
            delayInMonths: 3,
          },
        })
      })

      it('should return previous delai informations', async () => {
        const modificationRequestResult = await getModificationRequestDataForResponseTemplate(
          modificationRequestId.toString(),
          fakeAdminUser
        )

        expect(modificationRequestResult.isOk()).toBe(true)
        if (modificationRequestResult.isErr()) return

        const modificationRequestDTO = modificationRequestResult.value

        expect(modificationRequestDTO).toMatchObject({
          demandePrecedente: 'yes',
          dateDepotDemandePrecedente: formatDate(789),
          dureeDelaiDemandePrecedenteEnMois: '4',
          dateReponseDemandePrecedente: formatDate(897),
          autreDelaiDemandePrecedenteAccorde: 'yes', // asked for 4, given 3
          delaiDemandePrecedenteAccordeEnMois: '3',
        })
      })
    })
  })

  describe('when type is recours', () => {
    beforeAll(async () => {
      // Create the tables and remove all data
      await resetDatabase()

      await Project.create({
        ...project,
        isFinancementParticipatif: true,
        isInvestissementParticipatif: false,
        engagementFournitureDePuissanceAlaPointe: true,
        motifsElimination: 'Non instruit: blabla',
      })

      await File.create(makeFakeFile({ id: fileId, filename: 'filename' }))

      await User.create(makeFakeUser({ id: userId, fullName: 'John Doe' }))

      await ModificationRequest.create({
        id: modificationRequestId,
        projectId,
        userId,
        fileId,
        type: 'recours',
        requestedOn: 123,
        respondedOn: 321,
        respondedBy: userId2,
        status: 'envoyée',
        justification: 'justification',
        versionDate,
      })
    })

    it('should return recours specific modification request info fields', async () => {
      const modificationRequestResult = await getModificationRequestDataForResponseTemplate(
        modificationRequestId.toString(),
        fakeAdminUser
      )

      expect(modificationRequestResult.isOk()).toBe(true)
      if (modificationRequestResult.isErr()) return

      const modificationRequestDTO = modificationRequestResult.value

      expect(modificationRequestDTO).toMatchObject({
        type: 'recours',
        isFinancementParticipatif: 'yes',
        isInvestissementParticipatif: '',
        isEngagementParticipatif: 'yes',
        evaluationCarbone: '345',
        engagementFournitureDePuissanceAlaPointe: 'yes',
        prixReference: '456',

        nonInstruit: 'yes',
        motifsElimination: 'Non instruit: blabla',

        // related to Fessenheim AO
        tarifOuPrimeRetenue: "le prix de référence T de l'électricité retenu",
        tarifOuPrimeRetenueAlt: 'ce prix de référence',
        paragraphePrixReference: '7',
        affichageParagrapheECS: 'yes',

        eolien: '',
        AOInnovation: '',

        soumisGF: 'yes',
        renvoiSoumisAuxGarantiesFinancieres: 'doit être au minimum de 42 mois',
        renvoiDemandeCompleteRaccordement: '6.1',
        renvoiRetraitDesignationGarantieFinancieres: '5.3 et 6.2',
        paragrapheDelaiDerogatoire: '6.4',
        paragrapheAttestationConformite: '6.6',
        paragrapheEngagementIPFP: '3.2.6',
        renvoiModification: '5.4',
        delaiRealisationTexte: 'vingt-quatre (24) mois',
      })
    })
  })

  describe('when type is abandon', () => {
    describe('when abandon is granted without confirmation', () => {
      beforeAll(async () => {
        // Create the tables and remove all data
        await resetDatabase()

        await Project.create(project)
        await File.create(makeFakeFile({ id: fileId, filename: 'filename' }))
        await User.create(makeFakeUser({ id: userId, fullName: 'John Doe' }))
        await ModificationRequest.create({
          id: modificationRequestId,
          projectId,
          userId,
          fileId,
          type: 'abandon',
          requestedOn: 123,
          respondedOn: 321,
          respondedBy: userId2,
          status: 'envoyée',
          justification: 'justification',
          versionDate,
          delayInMonths: 2,
        })
      })

      it('should return abandon specific modification request info fields', async () => {
        const modificationRequestResult = await getModificationRequestDataForResponseTemplate(
          modificationRequestId.toString(),
          fakeAdminUser
        )

        expect(modificationRequestResult.isOk()).toBe(true)
        if (modificationRequestResult.isErr()) return

        const modificationRequestDTO = modificationRequestResult.value

        expect(modificationRequestDTO).toMatchObject({
          type: 'abandon',
          dateNotification: formatDate(321),
          referenceParagrapheAbandon: 'referenceParagrapheAbandon',
          contenuParagrapheAbandon: 'contenuParagrapheAbandon',
        })
      })
    })

    describe('when abandon is granted after confirmation', () => {
      beforeAll(async () => {
        // Create the tables and remove all data
        await resetDatabase()

        await Project.create(project)
        await File.create(makeFakeFile({ id: fileId, filename: 'filename' }))
        await User.create(makeFakeUser({ id: userId, fullName: 'John Doe' }))
        await ModificationRequest.create({
          id: modificationRequestId,
          projectId,
          userId,
          fileId,
          type: 'abandon',
          requestedOn: 123,
          respondedOn: 321,
          respondedBy: userId2,
          status: 'demande confirmée',
          justification: 'justification',
          confirmationRequestedOn: 6780000000,
          confirmedOn: 7890000000,
          versionDate,
          delayInMonths: 2,
        })
      })

      it('should include dateDemandeConfirmation and dateConfirmation', async () => {
        const modificationRequestResult = await getModificationRequestDataForResponseTemplate(
          modificationRequestId.toString(),
          fakeAdminUser
        )

        expect(modificationRequestResult.isOk()).toBe(true)
        if (modificationRequestResult.isErr()) return

        const modificationRequestDTO = modificationRequestResult.value

        expect(modificationRequestDTO).toMatchObject({
          dateDemandeConfirmation: formatDate(6780000000),
          dateConfirmation: formatDate(7890000000),
        })
      })
    })
  })
})
