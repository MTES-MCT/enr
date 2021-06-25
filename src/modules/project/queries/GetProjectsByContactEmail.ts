import { ResultAsync } from '../../../core/utils'
import { InfraNotAvailableError } from '../../shared'

export type GetProjectsByContactEmail = (
  email: string
) => ResultAsync<string[], InfraNotAvailableError>
