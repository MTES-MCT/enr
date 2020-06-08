# language: fr
Fonctionnalité: Listing des invitations

  @admin
  Scénario: Je vois les invitations porteur-projet non-utilisées
    Etant donné les invitations suivantes
      | email                 | fullName       | projectId | dreal | createdAt     | lastUsedAt    |
      | dreal-unused@test.com |                |           | Corse | 1591602495642 | 0             |
      | dreal-used@test.com   |                |           | Corse | 1591602495642 | 1591602495642 |
      | pp-unused@test.com    | porteur invité |           |       | 1591602495642 | 0             |
      | pp-used@test.com      |                |           |       | 1591602495642 | 1591602495642 |
    Lorsque je me rends sur la page admin qui liste les invitations
    Alors l'invitation de "pp-unused@test.com" se trouve dans la liste
    Et l'invitation de "dreal-unused@test.com" ne se trouve pas dans la liste
    Et l'invitation de "dreal-used@test.com" ne se trouve pas dans la liste
    Et l'invitation de "pp-used@test.com" ne se trouve pas dans la liste
    Et l'invitation de "invité-used@test.com" ne se trouve pas dans la liste
    Et l'invitation de "invité-unused@test.com" ne se trouve pas dans la liste

  @admin
  Scénario: Je relance les porteurs de projets invités et non-inscrits
    Etant donné les invitations suivantes
      | email                 | fullName         | projectId | dreal | createdAt     | lastUsedAt    |
      | dreal-unused@test.com |                  |           | Corse | 1591602495642 | 0             |
      | dreal-used@test.com   |                  |           | Corse | 1591602495642 | 1591602495642 |
      | pp-unused@test.com    | porteur invité   |           |       | 1591602495642 | 0             |
      | pp-unused2@test.com   | porteur invité 2 |           |       | 1591602495642 | 0             |
      | pp-used@test.com      |                  |           |       | 1591602495642 | 1591602495642 |
    Lorsque je me rends sur la page admin qui liste les invitations
    Et que je click sur le bouton "Relancer les 2 porteurs de projet non-inscrits"
    Et "pp-unused@test.com" reçoit un mail de notification avec un lien d'invitation
    Et "pp-unused2@test.com" reçoit un mail de notification avec un lien d'invitation
    Lorsque je me déconnecte
    Et que je click sur le lien d'invitation reçu dans le mail de notification
    Alors je suis dirigé vers la page de création de compte
    Et mon champ email est déjà pré-rempli
    Et mon champ nom est déjà pré-rempli avec "porteur invité 2"