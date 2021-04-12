import React from 'react'
import { dataId } from '../../helpers/testId'
import { ModificationRequestListItemDTO } from '../../modules/modificationRequest'
import { PaginatedList } from '../../types'
import { Request } from 'express'
import AdminDashboard from '../components/adminDashboard'
import RequestList from '../components/requestList'
import UserDashboard from '../components/userDashboard'
import { AppelOffre } from '../../entities'
import ROUTES from '../../routes'

interface ModificationRequestListProps {
  request: Request
  modificationRequests?: PaginatedList<ModificationRequestListItemDTO>
  appelsOffre: Array<AppelOffre>
}

/* Pure component */
export default function ModificationRequestList({
  request,
  modificationRequests,
  appelsOffre,
}: ModificationRequestListProps) {
  const {
    error,
    success,
    recherche,
    appelOffreId,
    periodeId,
    familleId,
    modificationRequestStatus,
    modificationRequestType,
  } = (request.query as any) || {}

  const hasFilters =
    appelOffreId || periodeId || familleId || modificationRequestStatus || modificationRequestType

  const periodes = appelsOffre.find((ao) => ao.id === appelOffreId)?.periodes

  const familles = appelsOffre
    .find((ao) => ao.id === appelOffreId)
    ?.familles.sort((a, b) => a.title.localeCompare(b.title))

  const Dashboard = request.user?.role === 'porteur-projet' ? UserDashboard : AdminDashboard
  return (
    <Dashboard role={request.user?.role} currentPage="list-requests">
      <div className="panel">
        <div className="panel__header">
          <h3>Demandes</h3>
          <form
            action={
              request.user?.role === 'porteur-projet'
                ? ROUTES.USER_LIST_REQUESTS
                : ROUTES.ADMIN_LIST_REQUESTS
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
                <div className="periode-panel" style={{ marginTop: 15 }}>
                  <div style={{ marginLeft: 2 }}>Par appel d'offre, période et famille</div>
                  <select
                    name="appelOffreId"
                    className={'appelOffre ' + (appelOffreId ? 'active' : '')}
                    {...dataId('appelOffreIdSelector')}
                    defaultValue={appelOffreId}
                  >
                    <option value="">Tous appels d'offres</option>
                    {appelsOffre.map((appelOffre) => (
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
                  <div style={{ marginLeft: 2 }}>Type</div>
                  <select
                    name="modificationRequestType"
                    className={modificationRequestType ? 'active' : ''}
                    {...dataId('modificationRequestTypeSelector')}
                    defaultValue={modificationRequestType || ''}
                  >
                    <option value="">Tous</option>
                    <option value="actionnaire">Actionnaire</option>
                    <option value="fournisseur">Fournisseur</option>
                    <option value="producteur">Producteur</option>
                    <option value="puissance">Puissance</option>
                    <option value="recours">Recours</option>
                    <option value="delai">Délai</option>
                    <option value="abandon">Abandon</option>
                  </select>
                </div>
                <div style={{ marginTop: 15 }}>
                  <div style={{ marginLeft: 2 }}>Statut</div>
                  <select
                    name="modificationRequestStatus"
                    className={modificationRequestStatus ? 'active' : ''}
                    {...dataId('modificationRequestStatusSelector')}
                    defaultValue={modificationRequestStatus || ''}
                  >
                    <option value="">Tous</option>
                    <option value="envoyée">Envoyée</option>
                    <option value="en instruction">En instruction</option>
                    <option value="en attente de confirmation">En attente de confirmation</option>
                    <option value="acceptée">Acceptée</option>
                    <option value="rejetée">Rejetée</option>
                    <option value="annulée">Annulée</option>
                  </select>
                </div>
              </div>
            </div>

            {hasFilters ? (
              <a style={{ marginTop: 10 }} href="#" {...dataId('resetSelectors')}>
                Retirer tous les filtres
              </a>
            ) : null}
          </form>
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
        <RequestList modificationRequests={modificationRequests} role={request.user?.role} />
      </div>
    </Dashboard>
  )
}
