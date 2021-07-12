import React from 'react'
import { logger } from '../../core/utils'
import { makeProjectIdentifier, Project, User } from '../../entities'
import { dataId } from '../../helpers/testId'
import routes from '../../routes'
import { PaginatedList } from '../../types'
import { ACTION_BY_ROLE } from './actions'
import Pagination from './pagination'

type Columns = 'Projet' | 'Candidat' | 'Puissance' | 'Region' | 'Departement' | 'Projet alloue'

type ColumnRenderer = (props: { project: Project; email: User['email'] }) => React.ReactNode

const ColumnComponent: Record<Columns, ColumnRenderer> = {
  Projet: function ProjetColumn({ project }) {
    return (
      <td valign="top" className="missingOwnerProjectList-projet-column">
        <div {...dataId('missingOwnerProjectList-item-nomProjet')}>{project.nomProjet}</div>
        <div
          style={{
            fontStyle: 'italic',
            lineHeight: 'normal',
            fontSize: 12,
          }}
        >
          <span {...dataId('missingOwnerProjectList-item-communeProjet')}>
            {project.communeProjet}
          </span>
          ,{' '}
          <span {...dataId('missingOwnerProjectList-item-departementProjet')}>
            {project.departementProjet}
          </span>
          , <span {...dataId('projectList-item-regionProjet')}>{project.regionProjet}</span>
          <div style={{ marginTop: 5, fontStyle: 'normal' }}>{makeProjectIdentifier(project)}</div>
        </div>
      </td>
    )
  } as ColumnRenderer,
  Candidat: function CandidatColumn({ project }) {
    return (
      <td valign="top" className="projectList-candidat-column">
        <div {...dataId('projectList-item-nomCandidat')}>{project.nomCandidat}</div>
        <div
          style={{
            fontStyle: 'italic',
            lineHeight: 'normal',
            fontSize: 12,
          }}
        >
          <span {...dataId('projectList-item-nomRepresentantLegal')}>
            {project.nomRepresentantLegal}
          </span>{' '}
          <span {...dataId('projectList-item-email')}>{project.email}</span>
        </div>
      </td>
    )
  } as ColumnRenderer,
  Puissance: function PuissanceColumn({ project }) {
    return (
      <td valign="top" className="projectList-puissance-column">
        <span {...dataId('projectList-item-puissance')}>{project.puissance}</span>{' '}
        <span
          style={{
            fontStyle: 'italic',
            lineHeight: 'normal',
            fontSize: 12,
          }}
        >
          {project.appelOffre?.unitePuissance}
        </span>
      </td>
    )
  } as ColumnRenderer,
  Region: function RegionColumn({ project }) {
    return (
      <td valign="top" className="projectList-puissance-column">
        <span {...dataId('projectList-item-region')}>{project.regionProjet}</span>{' '}
      </td>
    )
  } as ColumnRenderer,
  Departement: function DepartementColumn({ project }) {
    return (
      <td valign="top" className="projectList-puissance-column">
        <span {...dataId('projectList-item-departement')}>{project.departementProjet}</span>{' '}
      </td>
    )
  } as ColumnRenderer,
  'Projet alloue': function DepartementColumn({ project, email }) {
    return (
      <td valign="top" className="projectList-puissance-column">
        <span {...dataId('projectList-item-alloue')}>
          {project.email === email ? 'Oui' : 'Non'}
        </span>
      </td>
    )
  } as ColumnRenderer,
}

interface Props {
  projects: PaginatedList<Project> | Array<Project>
  displayColumns: Array<string>
  user: User
}

const MissingOwnerProjectList = ({ projects, displayColumns, user }: Props) => {
  const { role, email } = user

  let items: Array<Project>
  if (Array.isArray(projects)) {
    items = projects
  } else {
    items = projects.items
  }

  if (!items.length) {
    return (
      <table className="table">
        <tbody>
          <tr>
            <td>Aucun projet à lister</td>
          </tr>
        </tbody>
      </table>
    )
  }

  return (
    <>
      <table className="table missingOwnerProjectList" {...dataId('missing-owner-project-list')}>
        <thead>
          <tr>
            <th {...dataId('missingOwnerProjectList-checkbox')}>
              <input type="checkbox" {...dataId('missingOwnerProjectList-selectAll-checkbox')} />
            </th>
            {displayColumns?.map((column) => (
              <th key={column}>{column}</th>
            ))}
            {ACTION_BY_ROLE[role] ? <th></th> : ''}
          </tr>
        </thead>
        <tbody>
          {items.map((project) => {
            return (
              <tr
                key={'project_' + project.id}
                {...dataId('missingOwnerProjectList-item')}
                style={{ cursor: 'pointer' }}
                data-goto-projectid={project.id}
              >
                <td {...dataId('missingOwnerProjectList-checkbox')}>
                  <input
                    type="checkbox"
                    {...dataId('missingOwnerProjectList-item-checkbox')}
                    data-projectid={project.id}
                  />
                </td>
                {displayColumns?.map((column) => {
                  const Column = ColumnComponent[column]
                  if (!Column) {
                    logger.error(`Column ${column} could not be found`)
                    return <td></td>
                  }
                  return (
                    <Column
                      key={`project_${project.id}_${column}`}
                      project={project}
                      email={email}
                    />
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

      <form action={routes.USER_CLAIM_PROJECTS} method="post">
        <select
          name="projectIds"
          multiple
          {...dataId('claimed-project-list')}
          style={{ display: 'none' }}
        ></select>

        <div className="notification error" style={{ marginTop: 10, marginBottom: 10 }}>
          J'atteste sur l'honneur que je suis bien la personne désignée pour suivre le/les projet(s)
          sélectionné(s). En cas de fausse déclaration, je m'expose à un risque de poursuites
          judiciaires.
        </div>

        <button
          className="button"
          type="submit"
          name="submit"
          id="submit"
          disabled
          {...dataId('claim-projects-submit-button')}
        >
          Réclamer la propriété des projets sélectionnés
        </button>
      </form>

      {!Array.isArray(projects) && (
        <Pagination
          pagination={projects.pagination}
          pageCount={projects.pageCount}
          itemTitle="Projets"
        />
      )}
    </>
  )
}

export default MissingOwnerProjectList
