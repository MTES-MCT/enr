import { DomainError } from '../../../core/domain'

export class EliminatedProjectCannotBeAbandonnedError extends DomainError {
  constructor() {
    super('Le projet ne peut pas être abandonné car il a été éliminé.')
  }
}
