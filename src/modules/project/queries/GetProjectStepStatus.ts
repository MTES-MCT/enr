import { ResultAsync } from '../../../core/utils'
import { InfraNotAvailableError } from '../../shared'

export type GetProjectStepStatus = (
  projectStepId: String
) => ResultAsync<string, InfraNotAvailableError>
