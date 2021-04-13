import ROUTES from '../../../routes'

const drealActions = (project: {
  id: string
  gf: { id: string; status: 'à traiter' | 'validé' }
  isAbandoned: boolean
}) => {
  const actions: any = []
  const { gf } = project

  if (project.isAbandoned) return []

  if (!gf) return actions

  if (!gf.status || gf.status === 'à traiter') {
    actions.push({
      title: 'Marquer la garantie financière comme validée',
      link: ROUTES.UPDATE_PROJECT_STEP_STATUS({
        projectId: project.id,
        projectStepId: gf.id,
        newStatus: 'validé',
      }),
    })
  } else if (gf.status === 'validé') {
    actions.push({
      title: 'Marquer la garantie financière comme à traiter',
      link: ROUTES.UPDATE_PROJECT_STEP_STATUS({
        projectId: project.id,
        projectStepId: gf.id,
        newStatus: 'à traiter',
      }),
    })
  }
  return actions
}

export { drealActions }
