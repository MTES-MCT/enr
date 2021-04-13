import { ModificationRequestStatusDTO } from '../../modules/modificationRequest'

export const ModificationRequestColorByStatus: Record<
  ModificationRequestStatusDTO,
  'error' | 'success' | 'warning' | ''
> = {
  envoyée: '',
  'en instruction': 'warning',
  'en attente de confirmation': 'warning',
  'demande confirmée': 'warning',
  acceptée: 'success',
  rejetée: 'error',
  annulée: '',
}

export const ModificationRequestTitleColorByStatus: Record<ModificationRequestStatusDTO, string> = {
  envoyée: '#006be6',
  'en instruction': '#ff9947',
  'en attente de confirmation': '#ff9947',
  'demande confirmée': '#ff9947',
  acceptée: 'rgb(56, 118, 29)',
  rejetée: 'rgb(204, 0, 0)',
  annulée: '',
}
