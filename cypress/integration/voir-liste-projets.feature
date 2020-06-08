# language: fr
Fonctionnalité: Listing de projets

  @porteur-projet
  Scénario: Je vois les projets rattachés à mon compte
    Etant donné les projets suivants
      | nomProjet    |
      | projet autre |
    Etant donné que mon compte est lié aux projets suivants
      | nomProjet                  | classe | notifiedOn | puissance |
      | projet porteur 1           | Classé | 1234       | 12750     |
      | projet porteur non notifié | Classé | 0          | 12750     |
    Lorsque je me rends sur la page qui liste mes projets
    Alors le projet "projet porteur 1" se trouve dans la liste
    Et le projet "projet autre" ne se trouve pas dans la liste
    Et le projet "projet porteur non notifié" ne se trouve pas dans la liste
    Et la colonne "Prix" est visible
    Lorsque je click sur la ligne "projet porteur 1"
    Alors je suis redirigé vers la page du projet "projet porteur 1"

  @dreal
  Scénario: Je vois les projets rattachés à ma région
    Etant donné que je suis dreal de la region "Corse"
    Et les projets suivants
      | nomProjet                 | regionProjet     | notifiedOn |
      | projet region             | Corse / Bretagne | 1234       |
      | projet hors region        | Guadeloupe       | 1234       |
      | projet region non notifié | Guadeloupe       | 0          |
    Lorsque je me rends sur la page admin qui liste les projets
    Alors le projet "projet region" se trouve dans la liste
    Et le projet "projet hors region" ne se trouve pas dans la liste
    Et le projet "projet region non notifié" ne se trouve pas dans la liste
    Et la colonne "Prix" n'est pas visible
    Lorsque je click sur la ligne "projet region"
    Alors je suis redirigé vers la page du projet "projet region"


  @admin
  Scénario: Je vois tous les projets notifiés
    Etant donné que les projets suivants
      | nomProjet          | notifiedOn |
      | projet notifié     | 1234       |
      | projet non notifié | 0          |
    Lorsque je me rends sur la page admin qui liste les projets
    Alors le projet "projet notifié" se trouve dans la liste
    Et le projet "projet non notifié" ne se trouve pas dans la liste
    Et la colonne "Prix" est visible
    Lorsque je click sur la ligne "projet notifié"
    Alors je suis redirigé vers la page du projet "projet notifié"