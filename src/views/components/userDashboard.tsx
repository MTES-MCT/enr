import React from 'react'
import ROUTES from '../../routes'

interface UserDashboardProps {
  children: React.ReactNode
  currentPage: 'list-projects' | 'list-requests' | 'list-missing-owner-projects' | undefined
}

/* Pure component */
export default function UserDashboard({ children, currentPage }: UserDashboardProps) {
  return (
    <>
      <section className="section section-color" style={{ padding: '1em 0' }}>
        <div className="container">
          <h2 className="section__title" style={{ marginBottom: 0 }}>
            Portail Porteur de Projet
          </h2>
        </div>
      </section>
      <div className="dashboard">
        <aside className="side-menu" role="navigation">
          <ul>
            {typeof currentPage === 'undefined' ? (
              <li>
                <a className="active" style={{ fontSize: '2px', cursor: 'default' }}></a>
              </li>
            ) : (
              ''
            )}
            <li>
              <a
                href={ROUTES.USER_LIST_PROJECTS}
                className={currentPage === 'list-projects' ? 'active' : ''}
              >
                Mes projets
              </a>
            </li>
            <li>
              <a
                href={ROUTES.USER_LIST_REQUESTS}
                className={currentPage === 'list-requests' ? 'active' : ''}
              >
                Mes demandes
              </a>
            </li>
            <li>
              <a
                href={ROUTES.USER_LIST_MISSING_OWNER_PROJECTS}
                className={currentPage === 'list-missing-owner-projects' ? 'active' : ''}
              >
                Projets avant Avril 2020
              </a>
            </li>
          </ul>
        </aside>
        <div className="main">{children}</div>
      </div>
    </>
  )
}
