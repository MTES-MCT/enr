import { okAsync } from 'neverthrow'
import { User } from '../../entities'
import { InfraNotAvailableError } from '../../modules/shared'

export const createUserCredentials = (args: { role: User['role']; email: string }) =>
  okAsync<string, InfraNotAvailableError>('')
