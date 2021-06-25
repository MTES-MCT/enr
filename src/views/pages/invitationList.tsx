import { Request } from 'express'
import React from 'react'
import { AppelOffre } from '../../entities'
import { formatDate } from '../../helpers/formatDate'
import { dataId } from '../../helpers/testId'
import { PendingCandidateInvitationDTO } from '../../modules/candidateNotification'
import ROUTES from '../../routes'
import { PaginatedList } from '../../types'
import AdminDashboard from '../components/adminDashboard'
import Pagination from '../components/pagination'
interface InvitationListProps {
  request: Request
  invitations: PaginatedList<PendingCandidateInvitationDTO>
}

/* Pure component */
export default function InvitationList({ request, invitations }: InvitationListProps) {
  const { error, success } = (request.query as any) || {}

  return (
    <AdminDashboard role={request.user?.role} currentPage="list-invitations">
      <div className="panel">
        <div className="panel__header">
          <h3>Invitations en attente</h3>
          <p>
            Sont listées uniquement les invitations de candidats qui n‘ont pas donné lieu à une
            inscription. Les parrainnages ne sont pas inclus.
          </p>
        </div>
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

        <div className="pagination__count">
          <strong>{invitations.itemCount}</strong> invitations en attente{' '}
        </div>
        {!invitations.items.length ? (
          <table className="table">
            <tbody>
              <tr>
                <td>Aucune</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <>
            <table className="table" style={{ width: '100%' }} {...dataId('invitationList-list')}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th style={{ width: 150 }}>Date d‘invitation</th>
                  <th style={{ width: 100 }}></th>
                </tr>
              </thead>
              <tbody>
                {invitations.items.map((invitation) => {
                  return (
                    <tr key={'invitation_' + invitation.email} {...dataId('invitationList-item')}>
                      <td>
                        {invitation.email}{' '}
                        {invitation.fullName ? (
                          <div
                            style={{
                              fontStyle: 'italic',
                              lineHeight: 'normal',
                              fontSize: 12,
                            }}
                          >
                            {invitation.fullName}
                          </div>
                        ) : (
                          ''
                        )}
                      </td>
                      <td>
                        {invitation.invitedOn
                          ? formatDate(invitation.invitedOn, 'DD/MM/YYYY HH:mm')
                          : ''}
                      </td>
                      <td>
                        <form
                          action={ROUTES.ADMIN_INVITATION_RELANCE_ACTION}
                          method="POST"
                          style={{}}
                        >
                          <input type="hidden" name="email" value={invitation.email} />
                          <button
                            className="button-outline primary"
                            type="submit"
                            name="submit"
                            style={{ border: 0 }}
                          >
                            relancer
                          </button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {!Array.isArray(invitations) ? (
              <Pagination
                pagination={invitations.pagination}
                pageCount={invitations.pageCount}
                itemTitle="Invitations"
              />
            ) : (
              ''
            )}
          </>
        )}
      </div>
    </AdminDashboard>
  )
}
