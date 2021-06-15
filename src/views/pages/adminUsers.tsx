import { Request } from 'express'
import React from 'react'
import { ProjectAdmissionKey, User } from '../../entities'
import { formatDate } from '../../helpers/formatDate'
import { dataId } from '../../helpers/testId'
import routes from '../../routes'
import ROUTES from '../../routes'
import AdminDashboard from '../components/adminDashboard'
import { SuccessErrorBox } from '../components'

interface AdminUsersProps {
  request: Request
  users: Array<User>
}

/* Pure component */
export default function AdminUsers({ request, users }: AdminUsersProps) {
  const { error, success } = (request.query as any) || {}

  const registeredUsers = users.filter((user) => !!user.isRegistered)
  const invitations = users.filter((user) => !user.isRegistered)

  return (
    <AdminDashboard role={request.user?.role} currentPage="admin-users">
      <div className="panel">
        <div className="panel__header">
          <h3>Utilisateurs</h3>
        </div>
        <div className="panel__header">
          <h5>Ajouter un utilisateur</h5>

          <SuccessErrorBox success={success} error={error} />
          <form
            action={ROUTES.ADMIN_INVITE_USER_ACTION}
            method="post"
            style={{ maxWidth: 'auto', margin: '0 0 15px 0' }}
          >
            <div className="form__group">
              <label htmlFor="email">Adresse email</label>
              <input
                type="text"
                name="email"
                id="email"
                {...dataId('email-field')}
                style={{ width: 'auto' }}
              />
              <select name="role" {...dataId('role-field')}>
                <option value="acheteur-obligé">Acheteur obligé</option>
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
        {Boolean(registeredUsers?.length) && (
          <>
            <h5>Liste des utilisateurs</h5>
            <table className="table" {...dataId('projectList-list')}>
              <thead>
                <tr>
                  <th>Nom (email)</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {registeredUsers.map(({ id, fullName, email, role }) => {
                  return (
                    <tr key={'user_' + id} {...dataId('userList-item')}>
                      <td valign="top">
                        {fullName} ({email})
                      </td>
                      <td valign="top">{role}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        )}
        {Boolean(invitations?.length) && (
          <>
            <h5>Les utilisateurs invités</h5>
            <table className="table" {...dataId('projectList-list')}>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map(({ id, email, role }) => {
                  return (
                    <tr key={'user_' + id} {...dataId('userList-item')}>
                      <td valign="top">{email}</td>
                      <td valign="top">{role}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </AdminDashboard>
  )
}
