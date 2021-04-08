import { Request } from 'express'
import moment from 'moment'
import React from 'react'
import { logger } from '../../../core/utils'
import { ModificationRequestPageDTO } from '../../../modules/modificationRequest'
import { ErrorBox, SuccessBox } from '../../components'
import AdminDashboard from '../../components/adminDashboard'
import UserDashboard from '../../components/userDashboard'
import { ModificationRequestTitleByType } from '../../helpers'
import {
  AdminResponseForm,
  DelaiForm,
  DemandeDetails,
  DemandeStatus,
  ProjectDetails,
  RecoursForm,
  AbandonForm,
} from './components'

moment.locale('fr')

interface PageProps {
  request: Request
  modificationRequest: ModificationRequestPageDTO
}

/* Pure component */
export default function AdminModificationRequestPage({ request, modificationRequest }: PageProps) {
  const { user } = request
  const { error, success } = request.query as any
  const { type } = modificationRequest

  if (!user) {
    // Should never happen
    logger.error('Try to render ProjectDetails without a user')
    return <div />
  }
  const isResponsePossible = ['recours', 'delai', 'abandon'].includes(type)

  const isAdmin = user.role !== 'porteur-projet'

  const Dashboard = isAdmin ? AdminDashboard : UserDashboard

  return (
    <Dashboard role={user.role} currentPage={'list-requests'}>
      <div className="panel">
        <div className="panel__header" style={{ position: 'relative' }}>
          <h3>Demande de {ModificationRequestTitleByType[type]}</h3>
        </div>

        <DemandeDetails modificationRequest={modificationRequest} />

        <ProjectDetails modificationRequest={modificationRequest} />

        <ErrorBox error={error} />
        <SuccessBox success={success} />

        {isAdmin && !modificationRequest.respondedOn && (
          <div className="panel__header">
            <h4>Répondre</h4>

            <AdminResponseForm modificationRequest={modificationRequest}>
              {isResponsePossible && (
                <>
                  {modificationRequest.type === 'delai' && (
                    <DelaiForm modificationRequest={modificationRequest} />
                  )}

                  {modificationRequest.type === 'recours' && (
                    <RecoursForm modificationRequest={modificationRequest} />
                  )}

                  {modificationRequest.type === 'abandon' && (
                    <AbandonForm modificationRequest={modificationRequest} />
                  )}
                </>
              )}
            </AdminResponseForm>
          </div>
        )}

        <DemandeStatus modificationRequest={modificationRequest} />
      </div>
    </Dashboard>
  )
}
