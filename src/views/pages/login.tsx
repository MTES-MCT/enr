import { Request } from 'express'
import React from 'react'
import { dataId } from '../../helpers/testId'
import routes from '../../routes'

interface Props {
  request: Request
}

/* Pure component */
export default function LoginPage({ request }: Props) {
  const { error, success, email } = request?.query || {}

  return (
    <main role="main">
      <section className="section section-grey">
        <div className="container">
          <form action={routes.LOGIN_ACTION} method="post" name="form">
            <h3 id="login">Je m‘identifie</h3>
            {error ? (
              <div className="notification error" {...dataId('error-message')}>
                {error}
              </div>
            ) : (
              ''
            )}
            {success ? (
              <div className="notification success" {...dataId('success-message')}>
                {success}
              </div>
            ) : (
              ''
            )}
            <div className="form__group">
              <label htmlFor="email">Courrier électronique</label>
              <input
                type="email"
                name="email"
                id="email"
                {...dataId('email-field')}
                defaultValue={email || ''}
              />
              <label htmlFor="password">Mot de passe</label>
              <input type="password" name="password" id="password" {...dataId('password-field')} />
              <button
                className="button"
                type="submit"
                name="submit"
                id="submit"
                {...dataId('submit-button')}
              >
                Je m‘identifie
              </button>
              <a href={routes.FORGOTTEN_PASSWORD}>J‘ai oublié mon mot de passe</a>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
