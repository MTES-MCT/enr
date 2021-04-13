import { resetDatabase } from '../../../helpers'
import { ProjectAbandoned } from '../../../../../modules/project/events'
import makeFakeProject from '../../../../../__tests__/fixtures/project'
import models from '../../../models'
import { onProjectAbandoned } from './onProjectAbandoned'
import { UniqueEntityID } from '../../../../../core/domain'

describe('project.onProjectAbandoned', () => {
  const projectId = new UniqueEntityID().toString()

  const fakeProjects = [
    {
      id: projectId,
      garantiesFinancieresDueOn: 1,
      dcrDueOn: 1,
      completionDueOn: 1,
    },
  ].map(makeFakeProject)

  const { Project } = models

  beforeAll(async () => {
    await resetDatabase()
    await Project.bulkCreate(fakeProjects)

    const originalProject = await Project.findByPk(projectId)
    expect(originalProject.abandonedOn).toEqual(0)

    await onProjectAbandoned(models)(
      new ProjectAbandoned({
        payload: {
          projectId: projectId,
          abandonAcceptedBy: new UniqueEntityID().toString(),
        },
        original: {
          version: 1,
          occurredAt: new Date(1234),
        },
      })
    )
  })

  it('should set project.abandonedOn', async () => {
    const updatedProject = await Project.findByPk(projectId)
    expect(updatedProject.abandonedOn).toEqual(1234)
  })

  it('should reset project garantiesFinancieresDueOn, dcrDueOn and completionDueOn', async () => {
    const updatedProject = await Project.findByPk(projectId)
    expect(updatedProject.garantiesFinancieresDueOn).toEqual(0)
    expect(updatedProject.dcrDueOn).toEqual(0)
    expect(updatedProject.completionDueOn).toEqual(0)
  })
})
