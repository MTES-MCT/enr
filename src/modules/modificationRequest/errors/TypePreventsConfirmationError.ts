import { DomainError } from '../../../core/domain'

export class TypePreventsConfirmationError extends DomainError {
  constructor(type: string) {
    super(`Il n'est pas possible de demander de confirmation pour une demande de ${type}`)
  }
}
