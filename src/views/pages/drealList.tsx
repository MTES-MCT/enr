import { Request } from 'express'
import React from 'react'
import { DREAL, REGIONS, User } from '../../entities'
import { dataId } from '../../helpers/testId'
import ROUTES from '../../routes'
import AdminDashboard from '../components/adminDashboard'

interface DREALListProps {
  request: Request
  users: Array<{ user: User; dreals: Array<DREAL> }>
}

/* Pure component */
export default function DREALList({ request, users }: DREALListProps) {
  const { error, success } = (request.query as any) || {}

  const currentDrealUsers = users.filter(({ user }) => !!user.isRegistered)
  const invitations = users.filter(({ user }) => !user.isRegistered)

  return (
    <AdminDashboard role={request.user?.role} currentPage="list-dreal">
      <div className="panel">
        <div className="panel__header">
          <h3>Les DREALs</h3>
        </div>
        <div className="panel__header">
          <h5>Ajouter un utilisateur DREAL</h5>

          {success ? (
            <div className="notification success" {...dataId('success-message')}>
              {success}
            </div>
          ) : (
            ''
          )}
          {error ? (
            <div className="notification error" {...dataId('error-message')}>
              {error}
            </div>
          ) : (
            ''
          )}
          <form
            action={ROUTES.ADMIN_INVITE_USER_ACTION}
            method="post"
            style={{ maxWidth: 'auto', margin: '0 0 15px 0' }}
          >
            <div className="form__group">
              <label htmlFor="email">Adresse email</label>
              <input type="hidden" name="role" value="dreal" />
              <input
                type="text"
                name="email"
                id="email"
                {...dataId('email-field')}
                style={{ width: 'auto' }}
              />
              <select name="region" id="region" {...dataId('region-field')}>
                {[...REGIONS]
                  .sort((a, b) => a.localeCompare(b))
                  .map((region, index) => (
                    <option key={'region_' + index} value={region}>
                      {region}
                    </option>
                  ))}
              </select>
              <button
                className="button"
                type="submit"
                name="submit"
                id="submit"
                {...dataId('submit-button')}
              >
                Inviter
              </button>
            </div>
          </form>
        </div>
        {currentDrealUsers && currentDrealUsers.length ? (
          <>
            <h5>Les utilisateurs rattachés à une DREAL</h5>
            <table className="table" {...dataId('projectList-list')}>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>DREAL(s)</th>
                </tr>
              </thead>
              <tbody>
                {currentDrealUsers.map(({ user, dreals }) => {
                  return (
                    <tr key={'user_' + user.id} {...dataId('drealList-item')}>
                      <td valign="top">
                        {user.fullName} ({user.email})
                      </td>
                      <td valign="top">{dreals.join(', ')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        ) : (
          ''
        )}
        {invitations && invitations.length ? (
          <>
            <h5>Les utilisateurs invités</h5>
            <table className="table" {...dataId('projectList-list')}>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>DREAL(s)</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map(({ user, dreals }) => {
                  return (
                    <tr key={'user_' + user.id} {...dataId('drealList-item')}>
                      <td valign="top">{user.email}</td>
                      <td valign="top">{dreals.join(', ')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        ) : (
          ''
        )}
      </div>
    </AdminDashboard>
  )
}
