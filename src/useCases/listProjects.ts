import { Project, AppelOffre, Periode, Famille, User, DREAL } from '../entities'
import {
  ProjectRepo,
  UserRepo,
  ProjectFilters,
  ContextSpecificProjectListFilter,
} from '../dataAccess'
import { Pagination, PaginatedList } from '../types'

interface MakeUseCaseProps {
  searchForRegions: ProjectRepo['searchForRegions']
  findAllForRegions: ProjectRepo['findAllForRegions']
  searchForUser: ProjectRepo['searchForUser']
  findAllForUser: ProjectRepo['findAllForUser']
  searchAll: ProjectRepo['searchAll']
  findAll: ProjectRepo['findAll']
  findExistingAppelsOffres: ProjectRepo['findExistingAppelsOffres']
  findExistingPeriodesForAppelOffre: ProjectRepo['findExistingPeriodesForAppelOffre']
  findExistingFamillesForAppelOffre: ProjectRepo['findExistingFamillesForAppelOffre']
  findDrealsForUser: UserRepo['findDrealsForUser']
}

interface ListProjectsDeps {
  user: User
  appelOffreId?: AppelOffre['id']
  periodeId?: Periode['id']
  familleId?: Famille['id']
  pagination?: Pagination
  recherche?: string
  classement?: 'classés' | 'éliminés' | 'abandons'
  garantiesFinancieres?: 'submitted' | 'notSubmitted' | 'pastDue'
}

interface ListProjectsResult {
  projects: PaginatedList<Project>
  existingAppelsOffres: Array<AppelOffre['id']>
  existingPeriodes?: Array<Periode['id']>
  existingFamilles?: Array<Famille['id']>
}

export default function makeListProjects({
  searchForRegions,
  findAllForRegions,
  searchForUser,
  findAllForUser,
  searchAll,
  findAll,
  findExistingAppelsOffres,
  findExistingPeriodesForAppelOffre,
  findExistingFamillesForAppelOffre,
  findDrealsForUser,
}: MakeUseCaseProps) {
  return async function listProjects({
    user,
    appelOffreId,
    periodeId,
    familleId,
    pagination,
    recherche,
    classement,
    garantiesFinancieres,
  }: ListProjectsDeps): Promise<ListProjectsResult> {
    const query: ProjectFilters = {
      isNotified: true,
    }

    if (appelOffreId) {
      query.appelOffreId = appelOffreId

      if (periodeId) {
        query.periodeId = periodeId
      }

      if (familleId) {
        query.familleId = familleId
      }
    }

    switch (classement) {
      case 'classés':
        query.isClasse = true
        query.isAbandoned = false
        break
      case 'éliminés':
        query.isClasse = false
        query.isAbandoned = false
        break
      case 'abandons':
        query.isAbandoned = true
        break
    }

    if (garantiesFinancieres) {
      query.garantiesFinancieres = garantiesFinancieres
    }

    const result: any = {}

    let userSpecificProjectListFilter: ContextSpecificProjectListFilter
    let regions: DREAL[]

    switch (user.role) {
      case 'dreal':
        regions = await findDrealsForUser(user.id)
        result.projects =
          recherche && recherche.length
            ? await searchForRegions(regions, recherche, query, pagination)
            : await findAllForRegions(regions, query, pagination)

        userSpecificProjectListFilter = {
          regions,
        }
        break
      case 'porteur-projet':
        result.projects =
          recherche && recherche.length
            ? await searchForUser(user.id, recherche, query, pagination)
            : await findAllForUser(user.id, query, pagination)

        userSpecificProjectListFilter = {
          userId: user.id,
        }
        break
      case 'admin':
      case 'dgec':
        result.projects =
          recherche && recherche.length
            ? await searchAll(recherche, query, pagination)
            : await findAll(query, pagination)

        userSpecificProjectListFilter = {
          isNotified: true,
        }
    }

    result.existingAppelsOffres = await findExistingAppelsOffres(userSpecificProjectListFilter)

    if (appelOffreId && userSpecificProjectListFilter) {
      result.existingPeriodes = await findExistingPeriodesForAppelOffre(
        appelOffreId,
        userSpecificProjectListFilter
      )
      result.existingFamilles = await findExistingFamillesForAppelOffre(
        appelOffreId,
        userSpecificProjectListFilter
      )
    }

    return result as ListProjectsResult
  }
}
