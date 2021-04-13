import { DomainError } from '../../../core/domain'

export class StatusPreventsConfirmationError extends DomainError {
  constructor(currentStatus: string) {
    super(
      `Il n'est pas possible d'effectuer de confirmation pour cette demande car son status est ${currentStatus}`
    )
  }
}
