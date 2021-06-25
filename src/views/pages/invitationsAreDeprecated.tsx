import { Request } from 'express'
import React from 'react'
import { dataId } from '../../helpers/testId'
import AdminDashboard from '../components/adminDashboard'
import UserDashboard from '../components/userDashboard'

interface InvitationsAreDeprecatedProps {}

/* Pure component */
export default function InvitationsAreDeprecated({}: InvitationsAreDeprecatedProps) {
  return (
    <main role="main">
      <section className="section section-grey">
        <div className="container">
          <h2>Lien d'invitation périmé</h2>

          <p>
            Malheureusement, le lien d'invitation que vous essayez d'utiliser n'est plus valable.
          </p>
          <p>
            N'hésitez pas à demander à la personne qui vous a invité de vous envoyer une nouvelle
            invitation ou à nous contacter sur{' '}
            <a href="mailto:contact@potentiel.beta.gouv.fr">contact@potentiel.beta.gouv.fr</a>.
          </p>
        </div>
      </section>
    </main>
  )
}
