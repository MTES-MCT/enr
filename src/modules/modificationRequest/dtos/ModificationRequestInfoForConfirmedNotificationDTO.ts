export interface ModificationRequestInfoForConfirmedNotificationDTO {
  chargeAffaire: { email: string; fullName: string; id: string }
  nomProjet: string
  type: string
}
