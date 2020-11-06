import React from 'react'
import { Project } from '../../../../entities'
import { formatDate } from '../../../../helpers/formatDate'
import { dataId } from '../../../../helpers/testId'
import ROUTES from '../../../../routes'

interface EditProjectDataProps {
  project: Project
}

export const EditProjectData = ({ project }: EditProjectDataProps) => (
  <div>
    <form
      action={ROUTES.ADMIN_CORRECT_PROJECT_DATA_ACTION}
      method="post"
      encType="multipart/form-data"
    >
      <input type="hidden" name="projectId" value={project.id} />
      <input type="hidden" name="projectVersionDate" value={project.updatedAt?.getTime()} />
      <div className="form__group">
        <label>Numéro CRE</label>
        <input type="text" name="numeroCRE" defaultValue={project.numeroCRE} />
      </div>
      <div className="form__group">
        <label>Nom Projet</label>
        <input type="text" name="nomProjet" defaultValue={project.nomProjet} />
      </div>
      <div className="form__group">
        <label>Puissance actuelle (en {project.appelOffre?.unitePuissance})</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]+([\.,][0-9]+)?"
          name="puissance"
          defaultValue={project.puissance}
        />
      </div>
      <div className="form__group">
        <label>Prix de référence</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]+([\.,][0-9]+)?"
          name="prixReference"
          defaultValue={project.prixReference}
        />
      </div>
      <div className="form__group">
        <label>Evaluation carbone</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]+([\.,][0-9]+)?"
          name="evaluationCarbone"
          defaultValue={project.evaluationCarbone}
        />
      </div>
      <div className="form__group">
        <label>Note</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]+([\.,][0-9]+)?"
          name="note"
          defaultValue={project.note}
        />
      </div>
      <div className="form__group">
        <label>Nom candidat</label>
        <input type="text" name="nomCandidat" defaultValue={project.nomCandidat} />
      </div>
      <div className="form__group">
        <label>Nom représentant légal</label>
        <input
          type="text"
          name="nomRepresentantLegal"
          defaultValue={project.nomRepresentantLegal}
        />
      </div>
      <div className="form__group">
        <label>Email</label>
        <input type="email" name="email" defaultValue={project.email} />
      </div>
      <div className="form__group">
        <label>Adresse projet (rue et numéro)</label>
        <input type="text" name="adresseProjet" defaultValue={project.adresseProjet} />
      </div>
      <div className="form__group">
        <label>Code postal projet</label>
        <input type="text" name="codePostalProjet" defaultValue={project.codePostalProjet} />
      </div>
      <div className="form__group">
        <label>Commune</label>
        <input type="text" name="communeProjet" defaultValue={project.communeProjet} />
      </div>
      <div className="form__group">
        <label>Engagement de fourniture de puissance à la pointe</label>
        <input
          type="checkbox"
          name="engagementFournitureDePuissanceAlaPointe"
          defaultChecked={project.engagementFournitureDePuissanceAlaPointe}
        />
      </div>
      <div className="form__group">
        <label>Financement participatif</label>
        <input
          type="checkbox"
          name="isFinancementParticipatif"
          defaultChecked={project.isFinancementParticipatif}
        />
      </div>
      <div className="form__group">
        <label>Investissement participatif</label>
        <input
          type="checkbox"
          name="isInvestissementParticipatif"
          defaultChecked={project.isInvestissementParticipatif}
        />
      </div>
      <div className="form__group">
        <label>Classement</label>
        <select name="isClasse" defaultValue={project.classe === 'Classé' ? 1 : 0}>
          <option value={1}>Classé</option>
          <option value={0}>Eliminé</option>
        </select>
      </div>
      <div className="form__group">
        <label>Motif Elimination (si éliminé)</label>
        <input type="text" name="motifsElimination" defaultValue={project.motifsElimination} />
      </div>
      <div className="form__group">
        <label htmlFor="notificationDate">Date désignation (format JJ/MM/AAAA)</label>
        <input
          type="text"
          name="notificationDate"
          id="notificationDate"
          {...dataId('date-field')}
          defaultValue={formatDate(new Date(project.notifiedOn), 'DD/MM/YYYY')}
          style={{ width: 'auto' }}
        />
        <div
          className="notification error"
          style={{ display: 'none' }}
          {...dataId('error-message-wrong-format')}
        >
          Le format de la date saisie n'est pas conforme. Elle doit être de la forme JJ/MM/AAAA soit
          par exemple 25/05/2022 pour 25 Mai 2022.
        </div>
      </div>
      <div className="form__group">
        <label htmlFor="file">Attestation (facultatif)</label>
        <input type="file" name="file" id="file" />
      </div>
      <button className="button" type="submit" name="submit" {...dataId('submit-button')}>
        Sauvegarder ces changements
      </button>
    </form>
  </div>
)