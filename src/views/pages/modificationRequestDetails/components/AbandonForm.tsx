import React from 'react'
import { formatDate } from '../../../../helpers/formatDate'
import { dataId } from '../../../../helpers/testId'
import { ModificationRequestPageDTO } from '../../../../modules/modificationRequest'
import { DownloadResponseTemplate } from './DownloadResponseTemplate'

interface AbandonFormProps {
  modificationRequest: ModificationRequestPageDTO & { type: 'abandon' }
}
export const AbandonForm = ({ modificationRequest }: AbandonFormProps) => (
  <>
    <DownloadResponseTemplate modificationRequest={modificationRequest} />

    <div className="form__group">
      <label htmlFor="file">Réponse signée (fichier pdf)</label>
      <input type="file" name="file" id="file" />
    </div>

    {!['en attente de confirmation', 'demande confirmée'].includes(modificationRequest.status) && (
      <button className="button" type="submit" name="submitConfirm" {...dataId('submit-button')}>
        Demander une confirmation au porteur de projet
      </button>
    )}
  </>
)
