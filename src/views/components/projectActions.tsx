import React from 'react'
import { User } from '../../entities'
import { ACTION_BY_ROLE } from '../components/actions'
import { dataId } from '../../helpers/testId'

interface Props {
  project: {
    id: string
    isClasse: boolean
    isAbandoned: boolean
    notifiedOn?: Date
    certificateFile?: {
      id: string
      filename: string
    }
    appelOffreId: string
    periodeId: string
    familleId: string | undefined
    numeroCRE: string
    email: string
    nomProjet: string
    gf?: {
      id: string
      status: 'à traiter' | 'validé'
    }
  }
  role: User['role']
}

const ProjectActions = ({ project, role }: Props) => {
  if (!project || !role) {
    return <div />
  }

  const actions = ACTION_BY_ROLE[role]?.call(null, project)

  if (!actions || !actions.length) {
    return <div />
  }

  return (
    <div style={{ position: 'relative' }} {...dataId('project-actions')}>
      <svg className="icon list--action-trigger" {...dataId('action-menu-trigger')}>
        <use xlinkHref="#dots-vertical"></use>
      </svg>
      <ul className="list--action-menu" {...dataId('action-menu')}>
        {actions.map(({ title, actionId, projectId, link, disabled, isDownload }, actionIndex) => (
          <li key={'notif_' + projectId + '_' + actionIndex}>
            {disabled ? (
              <i>{title}</i>
            ) : (
              <a
                href={link}
                download={isDownload}
                data-actionid={actionId}
                data-projectid={projectId}
                {...dataId('item-action')}
              >
                {title}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ProjectActions
