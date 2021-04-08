import { ModificationRequestStatusDTO } from '../../modules/modificationRequest'

export const ModificationRequestStatusTitle: Record<ModificationRequestStatusDTO, string> = {
  envoyée: 'Envoyée',
  'en instruction': 'En instruction',
  'en attente de confirmation': 'En attente de confirmation',
  acceptée: 'Acceptée',
  rejetée: 'Rejetée',
  annulée: 'Annulée',
}
