import React from 'react'
import Statistiques from './statistiques'
import makeFakeRequest from '../../__tests__/fixtures/request'

export default { title: 'Statistiques' }

const props = {
  projetsTotal: 962,
  projetsLaureats: 558,
  porteursProjetNotifies: 162,
  porteursProjetNotifiesInscrits: 140,
  parrainages: 45,
  telechargementsAttestation: 863,
  projetsAvecAttestation: 925,
  gfDeposees: 100,
  gfDues: 152,
  dcrDeposees: 73,
  dcrDues: 260,
  demandes: {
    actionnaire: 0,
    producteur: 0,
    fournisseur: 0,
    puissance: 2,
    abandon: 1,
    recours: 7,
    delai: 0,
  },
}

export const empty = () => <Statistiques {...props} />
