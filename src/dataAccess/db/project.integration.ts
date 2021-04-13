import { v4 as uuid } from 'uuid'
import { Pagination } from '../../types'
import makeFakeProject from '../../__tests__/fixtures/project'
import makeFakeUser from '../../__tests__/fixtures/user'
import { projectRepo, resetDatabase, userRepo } from './'
import { sequelizeInstance } from '../../sequelize.legacy.config'

const defaultPagination = { page: 0, pageSize: 2 } as Pagination

describe('projectRepo sequelize', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  describe('findById(projectId)', () => {
    describe('when projectId exists', () => {
      it('should return the project', async () => {
        const projectId = uuid()
        const project = makeFakeProject({
          id: projectId,
          appelOffreId: 'Fessenheim',
          periodeId: '1',
          familleId: '2',
        })

        await projectRepo.save(project)

        const foundProject = await projectRepo.findById(projectId)
        expect(foundProject).toBeDefined()
        if (!foundProject) return
        expect(foundProject).toEqual(expect.objectContaining(project))

        const { famille, appelOffre } = foundProject
        expect(appelOffre).toBeDefined()
        if (!appelOffre) return

        expect(appelOffre.id).toEqual('Fessenheim')
        expect(appelOffre.periode).toBeDefined()
        if (!appelOffre.periode) return

        expect(appelOffre.periode.id).toEqual('1')
        expect(famille).toBeDefined()
        if (!famille) return

        expect(famille.id).toEqual('2')
      })
    })

    describe('when projectId does not exist', () => {
      it('should return undefined', async () => {
        const projectId = uuid()

        const foundProject = await projectRepo.findById(projectId)
        expect(foundProject).toBeUndefined()
      })
    })
  })

  describe('findAll', () => {
    describe('given no arguments', () => {
      it('should return a pagination list of all projects', async () => {
        await Promise.all(
          [
            {
              id: uuid(),
            },
            {
              id: uuid(),
            },
            {
              id: uuid(),
            },
            {
              id: uuid(),
            },
            {
              id: uuid(),
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const { itemCount, items, pageCount, pagination } = await projectRepo.findAll(
          undefined,
          defaultPagination
        )
        expect(itemCount).toEqual(5)
        expect(items).toHaveLength(2)
        expect(pageCount).toEqual(3)
        expect(pagination).toEqual(defaultPagination)
      })
    })

    describe('given filters', () => {
      it('should return all projects that match the filters', async () => {
        const targetProjectId = uuid()

        const goodProperties = {
          notifiedOn: 1,
          abandonedOn: 0,
          classe: 'Classé',
          appelOffreId: 'Fessenheim',
          periodeId: '2',
          familleId: '1',
          email: 'test122345@test.com',
          nomProjet: 'test',
        }

        await Promise.all(
          [
            {
              id: targetProjectId,
              ...goodProperties,
            },
            {
              id: uuid(),
              ...goodProperties,
              notifiedOn: 0,
            },
            {
              id: uuid(),
              ...goodProperties,
              classe: 'Eliminé',
            },
            {
              id: uuid(),
              ...goodProperties,
              appelOffreId: 'Autre',
            },
            {
              id: uuid(),
              ...goodProperties,
              periodeId: '1',
            },
            {
              id: uuid(),
              ...goodProperties,
              familleId: '2',
            },
            {
              id: uuid(),
              ...goodProperties,
              email: 'notgood@test.com',
            },
            {
              id: uuid(),
              ...goodProperties,
              nomProjet: 'other',
            },
            {
              id: uuid(),
              ...goodProperties,
              abandonedOn: 1,
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const { itemCount, items } = await projectRepo.findAll({
          isNotified: true,
          isClasse: true,
          isAbandoned: false,
          appelOffreId: 'Fessenheim',
          periodeId: '2',
          familleId: '1',
          email: 'test122345@test.com',
          nomProjet: 'test',
        })

        expect(itemCount).toEqual(1)
        expect(items[0].id).toEqual(targetProjectId)
      })
    })

    describe('given garantiesFinancieresSubmitted filter', () => {
      describe('with value of true', () => {
        it('should return all projects that have submitted garanties financieres', async () => {
          const targetProjectId = uuid()

          const goodProperties = {
            notifiedOn: 1,
            classe: 'Classé',
          }

          await Promise.all(
            [
              {
                id: targetProjectId,
                ...goodProperties,
              },
              {
                id: uuid(),
                ...goodProperties,
              },
            ]
              .map(makeFakeProject)
              .map(projectRepo.save)
          )

          // Add GF Step for the target project
          const ProjectStepModel = sequelizeInstance.model('project_step')
          await ProjectStepModel.create({
            id: uuid(),
            type: 'garantie-financiere',
            projectId: targetProjectId,
            stepDate: new Date(123),
            fileId: uuid(),
            submittedOn: new Date(345),
            submittedBy: uuid(),
          })

          const { itemCount, items } = await projectRepo.findAll({
            isNotified: true,
            garantiesFinancieres: 'submitted',
            isClasse: true,
          })

          expect(itemCount).toEqual(1)
          expect(items[0].id).toEqual(targetProjectId)
        })
      })

      describe('with value of false', () => {
        it('should return all projects that have a due date but have not submitted garanties financieres', async () => {
          const projectWithoutGF = uuid()
          const projectWithGF = uuid()

          const goodProperties = {
            notifiedOn: 1,
            garantiesFinancieresDueOn: Date.now() + 1e6,
            classe: 'Classé',
          }

          await Promise.all(
            [
              {
                id: projectWithoutGF,
                ...goodProperties,
              },
              {
                id: projectWithGF,
                ...goodProperties,
              },
              {
                id: uuid(),
                ...goodProperties,
                garantiesFinancieresDueOn: 0,
              },
            ]
              .map(makeFakeProject)
              .map(projectRepo.save)
          )

          // Add GF Step for the other project (not targetted)
          const ProjectStepModel = sequelizeInstance.model('project_step')
          await ProjectStepModel.create({
            id: uuid(),
            type: 'garantie-financiere',
            projectId: projectWithGF,
            stepDate: new Date(123),
            fileId: uuid(),
            submittedOn: new Date(345),
            submittedBy: uuid(),
          })

          const { itemCount, items } = await projectRepo.findAll({
            isNotified: true,
            garantiesFinancieres: 'notSubmitted',
            isClasse: true,
          })

          expect(itemCount).toEqual(1)
          expect(items[0].id).toEqual(projectWithoutGF)
        })
      })
    })

    describe('given garantiesFinancieresPastDue=true filter', () => {
      it('should return all projects that are due before today and not submitted yet', async () => {
        const projectWithoutGF = uuid()
        const projectWithGF = uuid()

        const goodProperties = {
          notifiedOn: 1,
          garantiesFinancieresDueOn: 1,
          classe: 'Classé',
        }

        await Promise.all(
          [
            {
              id: projectWithoutGF,
              ...goodProperties,
            },
            {
              id: projectWithGF,
              ...goodProperties,
            },
            {
              id: uuid(),
              ...goodProperties,
              garantiesFinancieresDueOn: Date.now() + 1e6,
            },
            {
              id: uuid(),
              ...goodProperties,
              garantiesFinancieresDueOn: 0,
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        // Add GF Step for the other project (not targetted)
        const ProjectStepModel = sequelizeInstance.model('project_step')
        await ProjectStepModel.create({
          id: uuid(),
          type: 'garantie-financiere',
          projectId: projectWithGF,
          stepDate: new Date(123),
          fileId: uuid(),
          submittedOn: new Date(345),
          submittedBy: uuid(),
        })

        const { itemCount, items } = await projectRepo.findAll({
          isNotified: true,
          garantiesFinancieres: 'pastDue',
          isClasse: true,
        })

        expect(itemCount).toEqual(1)
        expect(items[0].id).toEqual(projectWithoutGF)
      })
    })
  })

  describe('searchAll', () => {
    it('should return projects that contain the search term', async () => {
      const targetProjectId = uuid()
      await Promise.all(
        [
          {
            id: targetProjectId,
            nomCandidat: 'the search term is there',
          },
          {
            id: uuid(),
            nomCandidat: 'nothing here',
          },
        ]
          .map(makeFakeProject)
          .map(projectRepo.save)
      )

      const { itemCount, items } = await projectRepo.searchAll('term')
      expect(itemCount).toEqual(1)
      expect(items[0].id).toEqual(targetProjectId)
    })

    it('should return projects that match all the filters', async () => {
      const targetProjectId = uuid()
      await Promise.all(
        [
          {
            id: targetProjectId,
            nomCandidat: 'the search term is there',
            notifiedOn: 1,
          },
          {
            id: uuid(),
            nomCandidat: 'the search term is there',
            notifiedOn: 0,
          },
        ]
          .map(makeFakeProject)
          .map(projectRepo.save)
      )

      const { itemCount, items } = await projectRepo.searchAll('term', {
        isNotified: true,
      })
      expect(itemCount).toEqual(1)
      expect(items[0].id).toEqual(targetProjectId)
    })
  })

  describe('findAllForUser', () => {
    it('should only return user projects', async () => {
      const userId = uuid()

      await userRepo.insert(
        makeFakeUser({
          id: userId,
        })
      )

      const userProjectId = uuid()

      await Promise.all(
        [
          {
            // Good user, matches query
            id: userProjectId,
            classe: 'Classé',
            notifiedOn: 1,
          },
          {
            // Bad user, matches query
            id: uuid(),
            classe: 'Classé',
            notifiedOn: 1,
          },
        ]
          .map(makeFakeProject)
          .map(projectRepo.save)
      )

      await userRepo.addProject(userId, userProjectId)

      const results = await projectRepo.findAllForUser(userId, {
        isNotified: true,
        isClasse: true,
      })

      expect(results.itemCount).toEqual(1)
      expect(results.items[0].id).toEqual(userProjectId)
    })

    it('should return projects that match the query', async () => {
      const userId = uuid()

      await userRepo.insert(
        makeFakeUser({
          id: userId,
        })
      )

      const userProjectId1 = uuid()
      const userProjectId3 = uuid()
      const userProjectId4 = uuid()

      await Promise.all(
        [
          {
            // Good user, matches filter
            id: userProjectId1,
            classe: 'Classé',
            notifiedOn: 1,
          },
          {
            // Good user, does not match all filters
            id: userProjectId3,
            classe: 'Eliminé',
            notifiedOn: 1,
          },
          {
            // Good user, does not match all filters
            id: userProjectId4,
            classe: 'Classé',
            notifiedOn: 0,
          },
        ]
          .map(makeFakeProject)
          .map(projectRepo.save)
      )

      await userRepo.addProject(userId, userProjectId1)
      await userRepo.addProject(userId, userProjectId3)
      await userRepo.addProject(userId, userProjectId4)

      const results = await projectRepo.findAllForUser(userId, {
        isNotified: true,
        isClasse: true,
      })

      expect(results.itemCount).toEqual(1)
      expect(results.items[0].id).toEqual(userProjectId1)
    })
  })

  describe('searchForUser', () => {
    it('should return projects that contain the search term', async () => {
      const userId = uuid()

      await userRepo.insert(
        makeFakeUser({
          id: userId,
        })
      )

      const userProjectId1 = uuid()
      const userProjectId2 = uuid()

      await Promise.all(
        [
          {
            // Good user, good search term
            id: userProjectId1,
            nomCandidat: 'the search term is there',
          },
          {
            // Good user, bad search term
            id: userProjectId2,
            nomCandidat: 'nothing to see here',
          },
        ]
          .map(makeFakeProject)
          .map(projectRepo.save)
      )

      await userRepo.addProject(userId, userProjectId1)
      await userRepo.addProject(userId, userProjectId2)

      const results = await projectRepo.searchForUser(userId, 'term')

      expect(results.itemCount).toEqual(1)
      expect(results.items[0].id).toEqual(userProjectId1)
    })

    it('should only return user projects', async () => {
      const userId = uuid()

      await userRepo.insert(
        makeFakeUser({
          id: userId,
        })
      )

      const userProjectId = uuid()

      await Promise.all(
        [
          {
            // Good user, good search term
            id: userProjectId,
            nomCandidat: 'the search term is there',
          },
          {
            // Bad user, good search term
            id: uuid(),
            nomCandidat: 'the search term is there',
          },
        ]
          .map(makeFakeProject)
          .map(projectRepo.save)
      )

      await userRepo.addProject(userId, userProjectId)

      const results = await projectRepo.searchForUser(userId, 'term')

      expect(results.itemCount).toEqual(1)
      expect(results.items[0].id).toEqual(userProjectId)
    })

    it('should return projects that match all the filters', async () => {
      const userId = uuid()

      await userRepo.insert(
        makeFakeUser({
          id: userId,
        })
      )

      const userProjectId1 = uuid()
      const userProjectId3 = uuid()
      const userProjectId4 = uuid()

      await Promise.all(
        [
          {
            // Good user, good search term, matches filter
            id: userProjectId1,
            nomCandidat: 'the search term is there',
            classe: 'Classé',
            notifiedOn: 1,
          },
          {
            // Good user, good search term, does not match all filters
            id: userProjectId3,
            nomCandidat: 'the search term is there',
            classe: 'Eliminé',
            notifiedOn: 1,
          },
          {
            // Good user, good search term, does not match all filters
            id: userProjectId4,
            nomCandidat: 'the search term is there',
            classe: 'Classé',
            notifiedOn: 0,
          },
        ]
          .map(makeFakeProject)
          .map(projectRepo.save)
      )

      await userRepo.addProject(userId, userProjectId1)
      await userRepo.addProject(userId, userProjectId3)
      await userRepo.addProject(userId, userProjectId4)

      const results = await projectRepo.searchForUser(userId, 'term', {
        isNotified: true,
        isClasse: true,
      })

      expect(results.itemCount).toEqual(1)
      expect(results.items[0].id).toEqual(userProjectId1)
    })
  })

  describe('findAllForRegions', () => {
    describe('when a single region is given', () => {
      it('should only return projects from the region', async () => {
        const regionProjectId1 = uuid()
        const regionProjectId2 = uuid()

        await Promise.all(
          [
            {
              // Good region
              id: regionProjectId1,
              regionProjet: 'Corse',
            },
            {
              // Contains good region
              id: regionProjectId2,
              regionProjet: 'Occitanie / Corse / Bretagne',
            },
            {
              // Bad region
              id: uuid(),
              regionProjet: 'Bretagne',
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.findAllForRegions('Corse')

        expect(results.itemCount).toEqual(2)
        expect(results.items.map((item) => item.id)).toEqual(
          expect.arrayContaining([regionProjectId1, regionProjectId2])
        )
      })
    })

    describe('when multiple regions are given', () => {
      it('should only return projects from at least one of the regions', async () => {
        const regionProjectId1 = uuid()
        const regionProjectId2 = uuid()

        await Promise.all(
          [
            {
              // Good region
              id: regionProjectId1,
              regionProjet: 'Corse',
            },
            {
              // Contains a good region
              id: regionProjectId2,
              regionProjet: 'Occitanie / Bretagne',
            },
            {
              // Bad region
              id: uuid(),
              regionProjet: 'Bretagne',
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.findAllForRegions(['Corse', 'Occitanie'])

        expect(results.itemCount).toEqual(2)
        expect(results.items.map((item) => item.id)).toEqual(
          expect.arrayContaining([regionProjectId1, regionProjectId2])
        )
      })
    })

    it('should return projects that match all the filters', async () => {
      const regionProjectId1 = uuid()

      await Promise.all(
        [
          {
            // Good region, matches filter
            id: regionProjectId1,
            regionProjet: 'Corse',
            classe: 'Classé',
            notifiedOn: 1,
          },
          {
            // Good region, does not match all filters
            id: uuid(),
            regionProjet: 'Corse',
            classe: 'Eliminé',
            notifiedOn: 1,
          },
          {
            // Good region, does not match all filters
            id: uuid(),
            regionProjet: 'Corse',
            classe: 'Classé',
            notifiedOn: 0,
          },
        ]
          .map(makeFakeProject)
          .map(projectRepo.save)
      )

      const results = await projectRepo.findAllForRegions('Corse', {
        isNotified: true,
        isClasse: true,
      })

      expect(results.itemCount).toEqual(1)
      expect(results.items[0].id).toEqual(regionProjectId1)
    })
  })

  describe('searchForRegions', () => {
    it('should return projects that contain the search term', async () => {
      const regionProjectId = uuid()

      await Promise.all(
        [
          {
            // Good region, contains search term
            id: regionProjectId,
            regionProjet: 'Corse',
            nomCandidat: 'the search term is there',
          },
          {
            // Good region, bad search term
            id: uuid(),
            regionProjet: 'Corse',
            nomCandidat: 'nothing to see here',
          },
        ]
          .map(makeFakeProject)
          .map(projectRepo.save)
      )

      const results = await projectRepo.searchForRegions('Corse', 'term')

      expect(results.itemCount).toEqual(1)
      expect(results.items[0].id).toEqual(regionProjectId)
    })

    describe('when a single region is given', () => {
      it('should only return projects from the region', async () => {
        const regionProjectId1 = uuid()
        const regionProjectId2 = uuid()

        await Promise.all(
          [
            {
              // Good region, contains search term
              id: regionProjectId1,
              regionProjet: 'Corse',
              nomCandidat: 'the search term is there',
            },
            {
              // Good region, contains search term
              id: regionProjectId2,
              regionProjet: 'Occitanie / Corse / Bretagne',
              nomCandidat: 'the search term is there',
            },
            {
              // Bad region, good search term
              id: uuid(),
              regionProjet: 'Bretagne',
              nomCandidat: 'the search term is there',
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.searchForRegions('Corse', 'term')

        expect(results.itemCount).toEqual(2)
        expect(results.items.map((item) => item.id)).toEqual(
          expect.arrayContaining([regionProjectId1, regionProjectId2])
        )
      })
    })

    describe('when multiple regions are given', () => {
      it('should only return projects from at least one of the regions', async () => {
        const regionProjectId1 = uuid()
        const regionProjectId2 = uuid()

        await Promise.all(
          [
            {
              // Good region, contains search term
              id: regionProjectId1,
              regionProjet: 'Corse',
              nomCandidat: 'the search term is there',
            },
            {
              // Good region, contains search term
              id: regionProjectId2,
              regionProjet: 'Occitanie / Bretagne',
              nomCandidat: 'the search term is there',
            },
            {
              // Bad region, good search term
              id: uuid(),
              regionProjet: 'Bretagne',
              nomCandidat: 'the search term is there',
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.searchForRegions(['Corse', 'Occitanie'], 'term')

        expect(results.itemCount).toEqual(2)
        expect(results.items.map((item) => item.id)).toEqual(
          expect.arrayContaining([regionProjectId1, regionProjectId2])
        )
      })
    })

    it('should return projects that match all the filters', async () => {
      const regionProjectId1 = uuid()

      await Promise.all(
        [
          {
            // Good region, good search term, matches filter
            id: regionProjectId1,
            regionProjet: 'Corse',
            nomCandidat: 'the search term is there',
            classe: 'Classé',
            notifiedOn: 1,
          },
          {
            // Good region, good search term, does not match all filters
            id: uuid(),
            regionProjet: 'Corse',
            nomCandidat: 'the search term is there',
            classe: 'Eliminé',
            notifiedOn: 1,
          },
          {
            // Good region, good search term, does not match all filters
            id: uuid(),
            regionProjet: 'Corse',
            nomCandidat: 'the search term is there',
            classe: 'Classé',
            notifiedOn: 0,
          },
        ]
          .map(makeFakeProject)
          .map(projectRepo.save)
      )

      const results = await projectRepo.searchForRegions('Corse', 'term', {
        isNotified: true,
        isClasse: true,
      })

      expect(results.itemCount).toEqual(1)
      expect(results.items[0].id).toEqual(regionProjectId1)
    })
  })

  describe('findExistingAppelsOffres', () => {
    describe('given no params', () => {
      it('should return appelOffreIds which have at least one project', async () => {
        const targetAppelOffre = 'Fessenheim'

        await Promise.all(
          [
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.findExistingAppelsOffres()

        expect(results).toHaveLength(1)
        expect(results[0]).toEqual(targetAppelOffre)
      })
    })

    describe('given isNotified = true param', () => {
      it('should return appelOffreIds which have at least one notified project', async () => {
        const targetAppelOffre = 'Fessenheim'

        await Promise.all(
          [
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              notifiedOn: 1,
            },
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              notifiedOn: 1,
            },
            {
              id: uuid(),
              appelOffreId: 'other',
              notifiedOn: 0,
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.findExistingAppelsOffres({
          isNotified: true,
        })

        expect(results).toHaveLength(1)
        expect(results[0]).toEqual(targetAppelOffre)
      })
    })

    describe('given isNotified = false param', () => {
      it('should return appelOffreIds which have at least one unnotified project', async () => {
        const targetAppelOffre = 'Fessenheim'

        await Promise.all(
          [
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              notifiedOn: 0,
            },
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              notifiedOn: 0,
            },
            {
              id: uuid(),
              appelOffreId: 'other',
              notifiedOn: 1,
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.findExistingAppelsOffres({
          isNotified: false,
        })

        expect(results).toHaveLength(1)
        expect(results[0]).toEqual(targetAppelOffre)
      })
    })

    describe('given userId param', () => {
      it('should return appelOffreIds which have at least one notified project from this userId', async () => {
        const targetAppelOffre = 'Fessenheim'

        const userId = uuid()

        await userRepo.insert(
          makeFakeUser({
            id: userId,
          })
        )

        const userProjectId1 = uuid()
        const userProjectId2 = uuid()

        await Promise.all(
          [
            {
              id: userProjectId1,
              appelOffreId: targetAppelOffre,
              notifiedOn: 1,
            },
            {
              id: userProjectId2,
              appelOffreId: 'other',
              notifiedOn: 0,
            },
            {
              id: uuid(),
              appelOffreId: 'other',
              notifiedOn: 1,
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        await userRepo.addProject(userId, userProjectId1)
        await userRepo.addProject(userId, userProjectId2)

        const results = await projectRepo.findExistingAppelsOffres({
          userId,
        })

        expect(results).toHaveLength(1)
        expect(results[0]).toEqual(targetAppelOffre)
      })
    })

    describe('given regions param', () => {
      it('should return appelOffreIds which have at least one notified project from this region', async () => {
        const targetAppelOffre = 'Fessenheim'
        const targetAppelOffre2 = 'CRE4 - Batiment'
        await Promise.all(
          [
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              regionProjet: 'Corse',
              notifiedOn: 1,
            },
            {
              id: uuid(),
              appelOffreId: targetAppelOffre2,
              regionProjet: 'Bretagne / Occitanie',
              notifiedOn: 1,
            },
            {
              id: uuid(),
              appelOffreId: 'other',
              regionProjet: 'Corse',
              notifiedOn: 0,
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.findExistingAppelsOffres({
          regions: ['Corse', 'Occitanie'],
        })

        expect(results).toHaveLength(2)
        expect(results).toEqual(expect.arrayContaining([targetAppelOffre, targetAppelOffre2]))
      })
    })
  })

  describe('findExistingPeriodesForAppelOffre', () => {
    describe('given an appelOffreId and no params', () => {
      it('should return periodeIds which have at least one project in this appelOffreId', async () => {
        const targetAppelOffre = 'Fessenheim'
        const targetPeriode = '1'

        await Promise.all(
          [
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              periodeId: targetPeriode,
            },
            {
              id: uuid(),
              appelOffreId: 'otherAO',
              periodeId: 'otherPeriode',
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.findExistingPeriodesForAppelOffre(targetAppelOffre)

        expect(results).toHaveLength(1)
        expect(results[0]).toEqual(targetPeriode)
      })
    })

    describe('given isNotified = true param', () => {
      it('should return periodeIds which have at least one notified project in this appelOffreId', async () => {
        const targetAppelOffre = 'Fessenheim'
        const targetPeriode = '1'

        await Promise.all(
          [
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              periodeId: targetPeriode,
              notifiedOn: 1,
            },
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              periodeId: 'other',
              notifiedOn: 0,
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.findExistingPeriodesForAppelOffre(targetAppelOffre, {
          isNotified: true,
        })

        expect(results).toHaveLength(1)
        expect(results[0]).toEqual(targetPeriode)
      })
    })

    describe('given isNotified = false param', () => {
      it('should return periodeIds which have at least one unnotified project in this AppelOffre', async () => {
        const targetAppelOffre = 'Fessenheim'
        const targetPeriode = '1'

        await Promise.all(
          [
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              periodeId: targetPeriode,
              notifiedOn: 0,
            },
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              periodeId: 'other',
              notifiedOn: 1,
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.findExistingPeriodesForAppelOffre(targetAppelOffre, {
          isNotified: false,
        })

        expect(results).toHaveLength(1)
        expect(results[0]).toEqual(targetPeriode)
      })
    })

    describe('given userId param', () => {
      it('should return periodeIds which have at least one notified project from this userId in this appelOffre', async () => {
        const targetAppelOffre = 'Fessenheim'
        const targetPeriode = '1'

        const userId = uuid()

        await userRepo.insert(
          makeFakeUser({
            id: userId,
          })
        )

        const userProjectId1 = uuid()
        const userProjectId2 = uuid()

        await Promise.all(
          [
            {
              id: userProjectId1,
              appelOffreId: targetAppelOffre,
              periodeId: targetPeriode,
              notifiedOn: 1,
            },
            {
              id: userProjectId2,
              appelOffreId: targetAppelOffre,
              periodeId: 'other',
              notifiedOn: 0,
            },
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              periodeId: 'other2',
              notifiedOn: 1,
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        await userRepo.addProject(userId, userProjectId1)
        await userRepo.addProject(userId, userProjectId2)

        const results = await projectRepo.findExistingPeriodesForAppelOffre(targetAppelOffre, {
          userId,
        })

        expect(results).toHaveLength(1)
        expect(results[0]).toEqual(targetPeriode)
      })
    })

    describe('given regions param', () => {
      it('should return periodeIds which have at least one notified project from this region in this appelOffre', async () => {
        const targetAppelOffre = 'Fessenheim'
        const targetPeriode1 = '1'
        const targetPeriode2 = '2'
        await Promise.all(
          [
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              periodeId: targetPeriode1,
              regionProjet: 'Corse',
              notifiedOn: 1,
            },
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              periodeId: targetPeriode2,
              regionProjet: 'Bretagne / Occitanie',
              notifiedOn: 1,
            },
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              periodeId: 'other',
              regionProjet: 'Corse',
              notifiedOn: 0,
            },
            {
              id: uuid(),
              appelOffreId: 'other',
              periodeId: 'other2',
              regionProjet: 'Corse',
              notifiedOn: 1,
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.findExistingPeriodesForAppelOffre(targetAppelOffre, {
          regions: ['Corse', 'Occitanie'],
        })

        expect(results).toHaveLength(2)
        expect(results).toEqual(expect.arrayContaining([targetPeriode1, targetPeriode2]))
      })
    })
  })

  describe('findExistingFamillesForAppelOffre', () => {
    describe('given an appelOffreId and no params', () => {
      it('should return familleIds which have at least one project in this appelOffreId', async () => {
        const targetAppelOffre = 'Fessenheim'
        const targetFamille = '1'

        await Promise.all(
          [
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              familleId: targetFamille,
            },
            {
              id: uuid(),
              appelOffreId: 'otherAO',
              familleId: 'otherFamille',
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.findExistingFamillesForAppelOffre(targetAppelOffre)

        expect(results).toHaveLength(1)
        expect(results[0]).toEqual(targetFamille)
      })
    })

    describe('given isNotified = true param', () => {
      it('should return familleIds which have at least one notified project in this appelOffreId', async () => {
        const targetAppelOffre = 'Fessenheim'
        const targetFamille = '1'

        await Promise.all(
          [
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              familleId: targetFamille,
              notifiedOn: 1,
            },
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              familleId: 'other',
              notifiedOn: 0,
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.findExistingFamillesForAppelOffre(targetAppelOffre, {
          isNotified: true,
        })

        expect(results).toHaveLength(1)
        expect(results[0]).toEqual(targetFamille)
      })
    })

    describe('given isNotified = false param', () => {
      it('should return familleIds which have at least one unnotified project in this AppelOffre', async () => {
        const targetAppelOffre = 'Fessenheim'
        const targetFamille = '1'

        await Promise.all(
          [
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              familleId: targetFamille,
              notifiedOn: 0,
            },
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              familleId: 'other',
              notifiedOn: 1,
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.findExistingFamillesForAppelOffre(targetAppelOffre, {
          isNotified: false,
        })

        expect(results).toHaveLength(1)
        expect(results[0]).toEqual(targetFamille)
      })
    })

    describe('given userId param', () => {
      it('should return familleIds which have at least one notified project from this userId in this appelOffre', async () => {
        const targetAppelOffre = 'Fessenheim'
        const targetFamille = '1'

        const userId = uuid()

        await userRepo.insert(
          makeFakeUser({
            id: userId,
          })
        )

        const userProjectId1 = uuid()
        const userProjectId2 = uuid()

        await Promise.all(
          [
            {
              id: userProjectId1,
              appelOffreId: targetAppelOffre,
              familleId: targetFamille,
              notifiedOn: 1,
            },
            {
              id: userProjectId2,
              appelOffreId: targetAppelOffre,
              familleId: 'other',
              notifiedOn: 0,
            },
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              familleId: 'other2',
              notifiedOn: 1,
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        await userRepo.addProject(userId, userProjectId1)
        await userRepo.addProject(userId, userProjectId2)

        const results = await projectRepo.findExistingFamillesForAppelOffre(targetAppelOffre, {
          userId,
        })

        expect(results).toHaveLength(1)
        expect(results[0]).toEqual(targetFamille)
      })
    })

    describe('given regions param', () => {
      it('should return familleIds which have at least one notified project from this region in this appelOffre', async () => {
        const targetAppelOffre = 'Fessenheim'
        const targetFamille1 = '1'
        const targetFamille2 = '2'
        await Promise.all(
          [
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              familleId: targetFamille1,
              regionProjet: 'Corse',
              notifiedOn: 1,
            },
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              familleId: targetFamille2,
              regionProjet: 'Bretagne / Occitanie',
              notifiedOn: 1,
            },
            {
              id: uuid(),
              appelOffreId: targetAppelOffre,
              familleId: 'other',
              regionProjet: 'Corse',
              notifiedOn: 0,
            },
            {
              id: uuid(),
              appelOffreId: 'other',
              familleId: 'other2',
              regionProjet: 'Corse',
              notifiedOn: 1,
            },
          ]
            .map(makeFakeProject)
            .map(projectRepo.save)
        )

        const results = await projectRepo.findExistingFamillesForAppelOffre(targetAppelOffre, {
          regions: ['Corse', 'Occitanie'],
        })

        expect(results).toHaveLength(2)
        expect(results).toEqual(expect.arrayContaining([targetFamille1, targetFamille2]))
      })
    })
  })

  describe('countUnnotifiedProjects(appelOffreId, periodeId)', () => {
    it('should return the number of unnotified projects for the given appelOffreId and periode', async () => {
      const targetAppelOffre = 'Fessenheim'
      const targetPeriode = '1'

      await Promise.all(
        [
          {
            id: uuid(),
            appelOffreId: targetAppelOffre,
            periodeId: targetPeriode,
            notifiedOn: 1,
          },
          {
            id: uuid(),
            appelOffreId: targetAppelOffre,
            periodeId: 'other',
            notifiedOn: 0,
          },
          {
            id: uuid(),
            appelOffreId: 'other',
            periodeId: targetPeriode,
            notifiedOn: 0,
          },
        ]
          .map(makeFakeProject)
          .map(projectRepo.save)
      )

      expect(await projectRepo.countUnnotifiedProjects(targetAppelOffre, targetPeriode)).toEqual(0)

      await projectRepo.save(
        makeFakeProject({
          id: uuid(),
          appelOffreId: targetAppelOffre,
          periodeId: targetPeriode,
          notifiedOn: 0,
        })
      )

      expect(await projectRepo.countUnnotifiedProjects(targetAppelOffre, targetPeriode)).toEqual(1)
    })
  })

  describe('findProjectsWithGarantiesFinancieresPendingBefore(beforeDate)', () => {
    it('should return all projects with garantiesFinancieres and garantiesFinancieresDueOn before beforeDate and not null', async () => {
      const projectWithoutGF = uuid()
      const projectWithGF = uuid()

      const targetProjectProps = {
        garantiesFinancieresRelanceOn: 0,
        garantiesFinancieresDueOn: 1000,
        notifiedOn: 1,
        classe: 'Classé',
      }

      await Promise.all(
        [
          {
            id: projectWithoutGF,
            ...targetProjectProps,
          },
          {
            id: projectWithGF,
            ...targetProjectProps,
          },
          {
            id: uuid(),
            ...targetProjectProps,
            garantiesFinancieresDueOn: 2000,
          },
          {
            id: uuid(),
            ...targetProjectProps,
            garantiesFinancieresDueOn: 0,
          },
          {
            id: uuid(),
            ...targetProjectProps,
            notifiedOn: 0,
          },
          {
            id: uuid(),
            ...targetProjectProps,
            garantiesFinancieresRelanceOn: 1,
          },
          {
            id: uuid(),
            ...targetProjectProps,
            classe: 'Eliminé',
          },
        ]
          .map(makeFakeProject)
          .map(projectRepo.save)
      )

      // Add GF Step for the other project (not targetted)
      const ProjectStepModel = sequelizeInstance.model('project_step')
      await ProjectStepModel.create({
        id: uuid(),
        type: 'garantie-financiere',
        projectId: projectWithGF,
        stepDate: new Date(123),
        fileId: uuid(),
        submittedOn: new Date(345),
        submittedBy: uuid(),
      })

      const results = await projectRepo.findProjectsWithGarantiesFinancieresPendingBefore(1500)
      expect(results).toHaveLength(1)
      expect(results[0].id).toEqual(projectWithoutGF)
    })
  })
})
