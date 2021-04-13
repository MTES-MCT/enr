import { Project, User, AppelOffre, Famille, Periode, DREAL } from '../entities'
import { ResultAsync, Pagination, PaginatedList } from '../types'

export interface ProjectFilters {
  isNotified?: boolean
  garantiesFinancieres?: 'submitted' | 'notSubmitted' | 'pastDue'
  isClasse?: boolean
  isAbandoned?: boolean
  nomProjet?: string
  appelOffreId?: AppelOffre['id'] | AppelOffre['id'][]
  periodeId?: Periode['id'] | Periode['id'][]
  familleId?: Famille['id'] | Famille['id'][]
  email?: Project['email'] | Project['email'][]
}

export type ContextSpecificProjectListFilter =
  | {
      isNotified: boolean
    }
  | {
      userId: User['id']
    }
  | {
      regions: DREAL | DREAL[]
    }

export type ProjectRepo = {
  findById: (id: Project['id'], includeHistory?: boolean) => Promise<Project | undefined>
  findOne(query: Record<string, any>): Promise<Project | undefined>

  searchForUser(
    userId: User['id'],
    terms: string,
    filters?: ProjectFilters,
    pagination?: Pagination
  ): Promise<PaginatedList<Project>>
  findAllForUser(
    userId: User['id'],
    filters?: ProjectFilters,
    pagination?: Pagination
  ): Promise<PaginatedList<Project>>

  searchForRegions(
    regions: DREAL | DREAL[],
    terms: string,
    filters?: ProjectFilters,
    pagination?: Pagination
  ): Promise<PaginatedList<Project>>
  findAllForRegions(
    regions: DREAL | DREAL[],
    filters?: ProjectFilters,
    pagination?: Pagination
  ): Promise<PaginatedList<Project>>

  searchAll(
    terms: string,
    filters?: ProjectFilters,
    pagination?: Pagination
  ): Promise<PaginatedList<Project>>

  findAll(query?: ProjectFilters, pagination?: Pagination): Promise<PaginatedList<Project>>

  findExistingAppelsOffres(
    options?: ContextSpecificProjectListFilter
  ): Promise<Array<AppelOffre['id']>>

  findExistingPeriodesForAppelOffre(
    appelOffreId: AppelOffre['id'],
    options?: ContextSpecificProjectListFilter
  ): Promise<Array<Periode['id']>>

  findExistingFamillesForAppelOffre(
    appelOffreId: AppelOffre['id'],
    options?: ContextSpecificProjectListFilter
  ): Promise<Array<Famille['id']>>

  countUnnotifiedProjects(appelOffreId: AppelOffre['id'], periodeId: Periode['id']): Promise<number>

  findProjectsWithGarantiesFinancieresPendingBefore(beforeDate: number): Promise<Array<Project>>

  remove: (projectId: Project['id']) => ResultAsync<null>
  save: (project: Project) => ResultAsync<null>
  getUsers: (projectId: Project['id']) => Promise<Array<User>>
}
