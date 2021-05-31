import React from 'react'
import { dataId } from '../../../../helpers/testId'
import ROUTES from '../../../../routes'

interface GarantiesFinancieresFormProps {
  projectId: string
  date?: string
}
export const GarantiesFinancieresForm = ({ projectId, date }: GarantiesFinancieresFormProps) => (
  <form action={ROUTES.DEPOSER_ETAPE_ACTION} method="post" encType="multipart/form-data">
    <input type="hidden" name="type" id="type" value="garantie-financiere" />
    <div className="form__group">
      <label className="required" htmlFor="date">
        Date de constitution (format JJ/MM/AAAA)
      </label>
      <input
        type="text"
        name="stepDate"
        {...dataId('date-field')}
        defaultValue={date || ''}
        data-max-date={Date.now()}
      />
      <div
        className="notification error"
        style={{ display: 'none' }}
        {...dataId('error-message-out-of-bounds')}
      >
        Merci de saisir une date antérieure à la date d‘aujourd‘hui.
      </div>
      <div
        className="notification error"
        style={{ display: 'none' }}
        {...dataId('error-message-wrong-format')}
      >
        Le format de la date saisie n‘est pas conforme. Elle doit être de la forme JJ/MM/AAAA soit
        par exemple 25/05/2022 pour 25 Mai 2022.
      </div>
      <label htmlFor="file" className="required">
        Attestation
      </label>
      <input type="hidden" name="projectId" value={projectId} />
      <input type="file" name="file" {...dataId('file-field')} id="file" />
      <button
        className="button"
        type="submit"
        name="submit"
        id="submit"
        {...dataId('submit-gf-button')}
      >
        Envoyer
      </button>
      <button className="button-outline primary" {...dataId('frise-hide-content')}>
        Annuler
      </button>
    </div>
  </form>
)
