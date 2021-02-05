import React from 'react'
import routes from '../../routes'
import { User } from '../../entities'
import { Request } from 'express'

interface HeaderProps {
  request: Request
}

const Header = ({ request }: HeaderProps) => {
  const user = request?.user
  return (
    <header className="navbar" role="navigation">
      <div className="navbar__container">
        <a className="navbar__home" href="/index.html">
          <img
            className="navbar__logo"
            src="/images/logo-marianne.svg"
            alt="potentiel.beta.gouv.fr"
          />
          <span className="navbar__domain">
            potentiel.<b>beta.gouv</b>
            <i>.fr</i>
          </span>
        </a>

        <nav>
          <ul className="nav__links">
            <li className="nav__item">
              {user ? (
                <>
                  <span>{user.fullName}</span>
                  <a href={routes.LOGOUT_ACTION}>Me déconnecter</a>
                </>
              ) : (
                <a href={routes.LOGIN}>M'identifier</a>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
