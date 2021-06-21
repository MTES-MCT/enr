import models from '../../../models'
import { resetDatabase } from '../../../helpers'
import makeFakeProject from '../../../../../__tests__/fixtures/project'
import { onProjectNewRulesOptedIn } from './onProjectNewRulesOptedIn'
import { ProjectNewRulesOptedIn } from '../../../../../modules/project/events'
import { UniqueEntityID } from '../../../../../core/domain'

describe('project.onProjectNewRulesOptedIn', () => {
  const ProjectModel = models.Project
  const projectId = new UniqueEntityID().toString()
  const project = makeFakeProject({ id: projectId })

  beforeAll(async () => {
    await resetDatabase()
    await ProjectModel.bulkCreate([project])
  })

  it('should update the project new rules opt in', async () => {
    await onProjectNewRulesOptedIn(models)(
      new ProjectNewRulesOptedIn({
        payload: { projectId },
      })
    )

    const updatedProject = await ProjectModel.findByPk(projectId)
    expect(updatedProject.newRulesOptIn).toEqual(true)
  })
})
