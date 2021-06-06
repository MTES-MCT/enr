import { DomainError } from '../../../core/domain'

export class ValidatedGFCannotBeRemovedError extends DomainError {
  constructor() {
    super(
      'La garantie financière de votre projet ne peut pas être supprimée car elle a été validée par la DREAL.'
    )
  }
}
