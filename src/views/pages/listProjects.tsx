import { Request } from 'express'
import querystring from 'querystring'
import React from 'react'
import { AppelOffre, Famille, Periode, Project } from '../../entities'
import { dataId } from '../../helpers/testId'
import ROUTES from '../../routes'
import { PaginatedList } from '../../types'
import AdminDashboard from '../components/adminDashboard'
import { DownloadIcon } from '../components/downloadIcon'
import ProjectList from '../components/projectList'
import UserDashboard from '../components/userDashboard'

interface ListProjectsProps {
  request: Request
  projects?: PaginatedList<Project>
  appelsOffre: Array<AppelOffre>
  existingAppelsOffres: Array<AppelOffre['id']>
  existingPeriodes?: Array<Periode['id']>
  existingFamilles?: Array<Famille['id']>
}

/* Pure component */
export default function ListProjects({
  request,
  projects,
  appelsOffre,
  existingAppelsOffres,
  existingPeriodes,
  existingFamilles,
}: ListProjectsProps) {
  const {
    error,
    success,
    recherche,
    appelOffreId,
    periodeId,
    familleId,
    garantiesFinancieres,
    classement,
  } = (request.query as any) || {}

  const hasNonDefaultClassement =
    (request.user?.role === 'porteur-projet' && classement) ||
    (request.user && ['admin', 'dreal'].includes(request.user?.role) && classement !== 'classés')

  const hasFilters =
    appelOffreId || periodeId || familleId || garantiesFinancieres || hasNonDefaultClassement

  const periodes = appelsOffre
    .find((ao) => ao.id === appelOffreId)
    ?.periodes.filter((periode) => !existingPeriodes || existingPeriodes.includes(periode.id))

  const familles = appelsOffre
    .find((ao) => ao.id === appelOffreId)
    ?.familles.sort((a, b) => a.title.localeCompare(b.title))
    .filter((famille) => !existingFamilles || existingFamilles.includes(famille.id))

  const contents = (
    <>
      <div className="panel">
        <div className="panel__header">
          <h3>Projets</h3>
          <form
            action={
              request.user?.role === 'porteur-projet'
                ? ROUTES.USER_LIST_PROJECTS
                : ROUTES.ADMIN_LIST_PROJECTS
            }
            method="GET"
            style={{ maxWidth: 'auto', margin: '0 0 25px 0' }}
          >
            <div className="form__group" style={{ marginTop: 20 }}>
              <input
                type="text"
                name="recherche"
                {...dataId('recherche-field')}
                style={{ paddingRight: 40 }}
                defaultValue={recherche || ''}
                placeholder="Nom projet, candidat, numéro CRE, commune, département, ..."
              />
              <button
                className="overlay-button"
                style={{
                  right: 10,
                  top: 10,
                  width: 30,
                  height: 30,
                }}
                type="submit"
                {...dataId('submit-button')}
              >
                <svg
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="var(--grey)"
                  width="20"
                  height="20"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>

            <div className="form__group">
              <div
                {...dataId('visibility-toggle')}
                className={'filter-toggle' + (hasFilters ? ' open' : '')}
              >
                <span
                  style={{
                    borderBottom: '1px solid var(--light-grey)',
                    paddingBottom: 5,
                  }}
                >
                  Filtrer
                </span>
                <svg className="icon filter-icon">
                  <use xlinkHref="#expand"></use>
                </svg>
              </div>
              <div className="filter-panel">
                <div className="periode-panel">
                  <div style={{ marginLeft: 2 }}>Par appel d'offre, période et famille</div>
                  <select
                    name="appelOffreId"
                    className={'appelOffre ' + (appelOffreId ? 'active' : '')}
                    {...dataId('appelOffreIdSelector')}
                    defaultValue={appelOffreId}
                  >
                    <option value="">Tous appels d'offres</option>
                    {appelsOffre
                      .filter((appelOffre) => existingAppelsOffres.includes(appelOffre.id))
                      .map((appelOffre) => (
                        <option key={'appel_' + appelOffre.id} value={appelOffre.id}>
                          {appelOffre.shortTitle}
                        </option>
                      ))}
                  </select>
                  <select
                    name="periodeId"
                    className={periodeId ? 'active' : ''}
                    {...dataId('periodeIdSelector')}
                    defaultValue={periodeId}
                  >
                    <option value="">Toutes périodes</option>
                    {periodes && periodes.length
                      ? periodes.map((periode) => (
                          <option key={'appel_' + periode.id} value={periode.id}>
                            {periode.title}
                          </option>
                        ))
                      : null}
                  </select>
                  {!appelOffreId || (familles && familles.length) ? (
                    <select
                      name="familleId"
                      className={familleId ? 'active' : ''}
                      {...dataId('familleIdSelector')}
                      defaultValue={familleId}
                    >
                      <option value="">Toutes familles</option>
                      {familles && familles.length
                        ? familles.map((famille) => (
                            <option key={'appel_' + famille.id} value={famille.id}>
                              {famille.title}
                            </option>
                          ))
                        : null}
                    </select>
                  ) : null}
                </div>
                <div style={{ marginTop: 15 }}>
                  <div style={{ marginLeft: 2 }}>Garanties Financières</div>
                  <select
                    name="garantiesFinancieres"
                    className={garantiesFinancieres ? 'active' : ''}
                    {...dataId('garantiesFinancieresSelector')}
                    defaultValue={garantiesFinancieres || ''}
                  >
                    <option value="">Toutes</option>
                    <option value="submitted">Déposées</option>
                    <option value="notSubmitted">Non-déposées</option>
                    <option value="pastDue">En retard</option>
                  </select>
                </div>
                <div style={{ marginTop: 15 }}>
                  <div style={{ marginLeft: 2 }}>Classés/Eliminés/Abandons</div>
                  <select
                    name="classement"
                    className={hasNonDefaultClassement ? 'active' : ''}
                    {...dataId('classementSelector')}
                    defaultValue={classement || ''}
                  >
                    <option value="">Tous</option>
                    <option value="classés">Classés</option>
                    <option value="éliminés">Eliminés</option>
                    <option value="abandons">Abandons</option>
                  </select>
                </div>

                {request.user.role === 'admin' && appelOffreId && periodeId && (
                  <div style={{ marginTop: 15 }}>
                    <a
                      href={`${ROUTES.ADMIN_DOWNLOAD_PROJECTS_LAUREATS_CSV}?${querystring.stringify(
                        {
                          ...request.query,
                          beforeNotification: false,
                        }
                      )}`}
                      download
                    >
                      Liste des lauréats
                      <DownloadIcon color="red" />
                    </a>
                  </div>
                )}
              </div>
            </div>
            {hasFilters ? (
              <a style={{ marginTop: 10 }} href="#" {...dataId('resetSelectors')}>
                Retirer tous les filtres
              </a>
            ) : null}
          </form>
          {request.user?.role !== 'dreal' ? (
            <div>
              <div
                {...dataId('projectList-invitation-form-visibility-toggle')}
                className={'filter-toggle'}
              >
                <span
                  style={{
                    borderBottom: '1px solid var(--light-grey)',
                    paddingBottom: 5,
                  }}
                >
                  Donner accès à un utilisateur
                </span>
                <svg className="icon filter-icon">
                  <use xlinkHref="#expand"></use>
                </svg>
              </div>
              <div className="filter-panel">
                <form
                  action={ROUTES.INVITE_USER_TO_PROJECT_ACTION}
                  method="POST"
                  name="form"
                  style={{ margin: '15px 0 0 0' }}
                >
                  <select
                    name="projectId"
                    multiple
                    {...dataId('invitation-form-project-list')}
                    style={{ display: 'none' }}
                  ></select>
                  <label htmlFor="email">
                    Courrier électronique de la personne habilitée à suivre les projets selectionnés
                    ci-dessous:
                  </label>
                  <input type="email" name="email" id="email" {...dataId('email-field')} />
                  <button
                    className="button"
                    type="submit"
                    name="submit"
                    id="submit"
                    disabled
                    {...dataId('invitation-submit-button')}
                  >
                    Accorder les droits sur ces projets
                  </button>
                </form>
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
        {success ? (
          <div className="notification success" {...dataId('success-message')}>
            {success}
          </div>
        ) : (
          ''
        )}
        {error ? (
          <div className="notification error" {...dataId('error-message')}>
            {error}
          </div>
        ) : (
          ''
        )}
        {projects ? (
          <>
            <div className="pagination__count">
              <strong>{Array.isArray(projects) ? projects.length : projects.itemCount}</strong>{' '}
              projets
              <a
                href={`${ROUTES.DOWNLOAD_PROJECTS_CSV}?${querystring.stringify(
                  request.query as any
                )}`}
                download
              >
                <DownloadIcon />
              </a>
            </div>
            <ProjectList
              displayColumns={[
                'Projet',
                'Candidat',
                'Puissance',
                ...(request.user?.role === 'dreal' ? ['Garanties Financières'] : ['Prix']),
                'Evaluation Carbone',
                'Classé',
              ]}
              projects={projects}
              role={request.user?.role}
            />
          </>
        ) : (
          'Aucun projet à lister'
        )}
      </div>
    </>
  )

  if (request.user?.role === 'porteur-projet') {
    return <UserDashboard currentPage="list-projects">{contents}</UserDashboard>
  }

  return (
    <AdminDashboard
      role={request.user?.role}
      currentPage={
        request.query.garantiesFinancieres === 'submitted'
          ? 'list-garanties-financieres'
          : 'list-projects'
      }
    >
      {contents}
    </AdminDashboard>
  )
}
