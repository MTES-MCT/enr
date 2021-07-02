import React from 'react'
import { dataId } from '../../helpers/testId'
import ROUTES from '../../routes'
import { Request } from 'express'
import AdminDashboard from '../components/adminDashboard'

interface AdminListProjectsProps {
  request: Request
  importError?: string
}

/* Pure component */
export default function AdminListProjects({ request, importError }: AdminListProjectsProps) {
  const { error, success } = (request.query as any) || {}
  return (
    <AdminDashboard role={request.user?.role} currentPage="import-projects">
      <div className="panel">
        <div className="panel__header">
          <h3>Importer des candidats</h3>
        </div>
        <form action={ROUTES.IMPORT_PROJECTS_ACTION} method="post" encType="multipart/form-data">
          {success ? (
            <>
              <div className="notification success" {...dataId('success-message')}>
                {success}
              </div>
            </>
          ) : (
            ''
          )}
          {error || importError ? (
            <div className="notification error" {...dataId('error-message')}>
              {(importError || error).split('\n').map((piece) => (
                <>
                  {piece}
                  <br />
                </>
              ))}
            </div>
          ) : (
            ''
          )}

          <div className="form__group">
            <label htmlFor="candidats">Fichier csv des candidats</label>
            <input type="file" name="candidats" {...dataId('candidats-field')} id="candidats" />
            <button
              className="button"
              type="submit"
              name="submit"
              id="submit"
              {...dataId('submit-button')}
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </AdminDashboard>
  )
}
