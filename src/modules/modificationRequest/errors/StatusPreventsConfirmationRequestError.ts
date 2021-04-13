import { DomainError } from '../../../core/domain'

export class StatusPreventsConfirmationRequestError extends DomainError {
  constructor(currentStatus: string) {
    super(
      `Il n'est pas possible de demander de confirmation pour cette demande car son status est ${currentStatus}`
    )
  }
}
