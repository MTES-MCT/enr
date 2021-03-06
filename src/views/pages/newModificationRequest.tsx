import React from 'react'

import { Project } from '../../entities'

import ROUTES from '../../routes'
import { dataId } from '../../helpers/testId'

import UserDashboard from '../components/userDashboard'
import { Request } from 'express'

import { formatDate } from '../../helpers/formatDate'

import { appelsOffreStatic } from '../../dataAccess/inMemory'

import moment from 'moment'
moment.locale('fr')

interface PageProps {
  request: Request
  project: Project
  cahierChargesURL?: string
}

const titlePerAction = {
  delai: 'Je demande un délai supplémentaire',
  actionnaire: "Je signale un changement d'actionnaire",
  fournisseur: 'Je signale un changement de fournisseur',
  puissance: 'Je signale un changement de puissance',
  producteur: 'Je signale un changement de producteur',
  abandon: 'Je demande un abandon de mon projet',
  recours: 'Je demande un recours',
}

const getunitePuissanceForAppelOffre = (appelOffreId) => {
  return appelsOffreStatic.find((item) => item.id === appelOffreId)?.unitePuissance
}

const getDelayForAppelOffre = (appelOffreId) => {
  return appelsOffreStatic.find((item) => item.id === appelOffreId)?.delaiRealisationEnMois
}

export { titlePerAction }

/* Pure component */
export default function NewModificationRequestPage({
  request,
  project,
  cahierChargesURL,
}: PageProps) {
  const { action, error, success, puissance, actionnaire, justification, delayInMonths } =
    (request.query as any) || {}

  const actionShouldBeDisabled = ['puissance', 'producteur', 'actionnaire', 'fournisseur'].includes(
    action
  )

  return (
    <UserDashboard currentPage={'list-requests'}>
      <div className="panel">
        <div className="panel__header">
          <h3>{titlePerAction[action]}</h3>
        </div>

        <form action={ROUTES.DEMANDE_ACTION} method="post" encType="multipart/form-data">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="type" value={action} />
          <div className="form__group">
            <h4></h4>
            <div style={{ marginBottom: 5 }}>Concernant le projet:</div>
            <div
              className="text-quote"
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                marginBottom: 10,
              }}
            >
              <div {...dataId('modificationRequest-item-nomProjet')}>{project.nomProjet}</div>
              <div
                style={{
                  fontStyle: 'italic',
                  lineHeight: 'normal',
                  fontSize: 12,
                }}
              >
                <div {...dataId('modificationRequest-item-nomCandidat')}>{project.nomCandidat}</div>
                <span {...dataId('modificationRequest-item-communeProjet')}>
                  {project.communeProjet}
                </span>
                ,{' '}
                <span {...dataId('modificationRequest-item-departementProjet')}>
                  {project.departementProjet}
                </span>
                ,{' '}
                <span {...dataId('modificationRequest-item-regionProjet')}>
                  {project.regionProjet}
                </span>
              </div>
              <div {...dataId('modificationRequest-item-puissance')}>
                {project.puissance} {getunitePuissanceForAppelOffre(project.appelOffreId)}
              </div>
              <div>
                Désigné le{' '}
                <span {...dataId('modificationRequest-item-designationDate')}>
                  {formatDate(project.notifiedOn, 'DD/MM/YYYY')}
                </span>{' '}
                pour la période{' '}
                <span {...dataId('modificationRequest-item-periode')}>{project.periodeId}</span>{' '}
                <span {...dataId('modificationRequest-item-famille')}>{project.familleId}</span>
              </div>
            </div>
            {error ? (
              <div className="notification error" {...dataId('modificationRequest-errorMessage')}>
                {error}
              </div>
            ) : (
              ''
            )}
            {success ? (
              <div
                className="notification success"
                {...dataId('modificationRequest-successMessage')}
              >
                {success}
              </div>
            ) : (
              ''
            )}
            <div>
              <label className="required">
                <strong>
                  Veuillez saisir les modalités d'instruction à appliquer à ce changement
                </strong>
              </label>

              {!project.newRulesOptIn && (
                <>
                  <label htmlFor="Anciennes règles">
                    Instruction selon les dispositions du cahier des charges en vigueur au moment de
                    la candidature.{' '}
                    <strong>Je dois envoyer ma demande ou mon signalement au format papier</strong>{' '}
                    {cahierChargesURL && (
                      <a href={cahierChargesURL}>(voir le cahier des charges)</a>
                    )}
                  </label>
                  <input
                    type="radio"
                    name="newRulesOptIn"
                    value="Anciennes règles"
                    {...dataId('modificationRequest-oldRules')}
                    disabled={project.newRulesOptIn}
                  />
                </>
              )}
              <label htmlFor="Nouvelles règles">
                Instruction selon le cahier de charges, en application du décret n° 2019-1175 du 14
                novembre 2019
              </label>
              <input
                type="radio"
                name="newRulesOptIn"
                value="Nouvelles règles"
                defaultChecked={project.newRulesOptIn}
                {...dataId('modificationRequest-newRules')}
                disabled={project.newRulesOptIn}
              />
            </div>

            <div className="notification warning" style={{ marginTop: 10, marginBottom: 10 }}>
              <span>
                Si vous choisissez une instruction selon le cahier des charges modifié, ce choix
                s'appliquera à toutes les futures demandes faites sous Potentiel.
                <br />
                <br />
                Une modification ultérieure pourra toujours être instruite selon le cahier des
                charges en vigueur au moment du dépôt de l'offre, à condition qu'elle soit soumise
                au format papier en précisant ce choix.
                <br />
                <br />A l'inverse, tant que l'instruction est demandée selon le cahier des charges
                en vigueur au moment du dépôt de l'offre, le choix du mode d'instruction sera
                proposé à chaque nouveau dépôt.
              </span>
            </div>

            <div {...dataId('modificationRequest-demandesInputs')}>
              {action === 'puissance' ? (
                <>
                  <label>
                    Puissance à la notification (en{' '}
                    {getunitePuissanceForAppelOffre(project.appelOffreId)})
                  </label>
                  <input
                    type="text"
                    disabled
                    value={project.puissanceInitiale}
                    {...dataId('modificationRequest-presentPuissanceField')}
                  />
                  {project.puissance !== project.puissanceInitiale && (
                    <>
                      <label>{getunitePuissanceForAppelOffre(project.appelOffreId)})</label>
                      <input type="text" disabled value={project.puissance} />
                    </>
                  )}
                  <label className="required" style={{ marginTop: 10 }} htmlFor="puissance">
                    Nouvelle puissance (en {getunitePuissanceForAppelOffre(project.appelOffreId)})
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]+([\.,][0-9]+)?"
                    name="puissance"
                    id="puissance"
                    defaultValue={puissance || ''}
                    {...dataId('modificationRequest-puissanceField')}
                  />

                  <div
                    className="notification warning"
                    style={{ display: 'none' }}
                    {...dataId('modificationRequest-puissance-error-message-out-of-bounds')}
                  >
                    Une autorisation est nécessaire pour une variation de puissance par rapport à la
                    puissance notifiée supérieure à 10%, sauf en cas d'obligation imposée par
                    l'administration. Joindre un justificatif.
                  </div>
                  <div
                    className="notification error"
                    style={{ display: 'none' }}
                    {...dataId('modificationRequest-puissance-error-message-wrong-format')}
                  >
                    Le format saisi n’est pas conforme (penser à utiliser un nombre décimal séparé
                    par un point).
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <label style={{ marginTop: 10 }} className="required" htmlFor="justification">
                      <strong>Veuillez nous indiquer les raisons qui motivent votre demande</strong>
                      <br />
                      Pour faciliter le traitement de votre demande, veillez à détailler les raisons
                      ayant conduit à ce besoin de modification (contexte, facteurs extérieurs, etc)
                    </label>
                    <textarea
                      name="justification"
                      id="justification"
                      defaultValue={justification || ''}
                      {...dataId('modificationRequest-justificationField')}
                    />
                    <label htmlFor="candidats" style={{ marginTop: 10 }}>
                      Courrier explicatif ou décision administrative (obligatoire dans le cas où la
                      variation est supérieure à 10%)
                    </label>
                    <input
                      type="file"
                      name="file"
                      {...dataId('modificationRequest-fileField')}
                      id="file"
                    />
                  </div>
                </>
              ) : (
                ''
              )}
              {action === 'fournisseur' ? (
                <>
                  <div>
                    <h3 style={{ marginTop: 15 }}>Modules ou films</h3>
                    <label>Ancien fournisseur</label>
                    <input
                      type="text"
                      disabled
                      defaultValue={project.details?.['Nom du fabricant \n(Modules ou films)']}
                    />
                    <label htmlFor="Nom du fabricant \n(Modules ou films)">
                      Nouveau fournisseur
                    </label>
                    <input
                      type="text"
                      name="Nom du fabricant \n(Modules ou films)"
                      id="Nom du fabricant \n(Modules ou films)"
                      {...dataId('modificationRequest-Nom du fabricant \n(Modules ou films)Field')}
                    />
                  </div>
                  <div>
                    <h3 style={{ marginTop: 15 }}>Cellules</h3>
                    <label>Ancien fournisseur</label>
                    <input
                      type="text"
                      disabled
                      defaultValue={project.details?.['Nom du fabricant (Cellules)']}
                    />
                    <label htmlFor="Nom du fabricant (Cellules)">Nouveau fournisseur</label>
                    <input
                      type="text"
                      name="Nom du fabricant (Cellules)"
                      id="Nom du fabricant (Cellules)"
                      {...dataId('modificationRequest-Nom du fabricant (Cellules)Field')}
                    />
                  </div>
                  <div>
                    <h3 style={{ marginTop: 15 }}>Plaquettes de silicium (wafers)</h3>
                    <label>Ancien fournisseur</label>
                    <input
                      type="text"
                      disabled
                      defaultValue={
                        project.details?.['Nom du fabricant \n(Plaquettes de silicium (wafers))']
                      }
                    />
                    <label htmlFor="Nom du fabricant \n(Plaquettes de silicium (wafers))">
                      Nouveau fournisseur
                    </label>
                    <input
                      type="text"
                      name="Nom du fabricant \n(Plaquettes de silicium (wafers))"
                      id="Nom du fabricant \n(Plaquettes de silicium (wafers))"
                      {...dataId(
                        'modificationRequest-Nom du fabricant \n(Plaquettes de silicium (wafers))Field'
                      )}
                    />
                  </div>
                  <div>
                    <h3 style={{ marginTop: 15 }}>Polysilicium</h3>
                    <label>Ancien fournisseur</label>
                    <input
                      type="text"
                      disabled
                      defaultValue={project.details?.['Nom du fabricant \n(Polysilicium)']}
                    />
                    <label htmlFor="Nom du fabricant \n(Polysilicium)">Nouveau fournisseur</label>
                    <input
                      type="text"
                      name="Nom du fabricant \n(Polysilicium)"
                      id="Nom du fabricant \n(Polysilicium)"
                      {...dataId('modificationRequest-Nom du fabricant \n(Polysilicium)Field')}
                    />
                  </div>
                  <div>
                    <h3 style={{ marginTop: 15 }}>Postes de conversion</h3>
                    <label>Ancien fournisseur</label>
                    <input
                      type="text"
                      disabled
                      defaultValue={project.details?.['Nom du fabricant \n(Postes de conversion)']}
                    />
                    <label htmlFor="Nom du fabricant \n(Postes de conversion)">
                      Nouveau fournisseur
                    </label>
                    <input
                      type="text"
                      name="Nom du fabricant \n(Postes de conversion)"
                      id="Nom du fabricant \n(Postes de conversion)"
                      {...dataId(
                        'modificationRequest-Nom du fabricant \n(Postes de conversion)Field'
                      )}
                    />
                  </div>
                  <div>
                    <h3 style={{ marginTop: 15 }}>Structure</h3>
                    <label>Ancien fournisseur</label>
                    <input
                      type="text"
                      disabled
                      defaultValue={project.details?.['Nom du fabricant \n(Structure)']}
                    />
                    <label htmlFor="Nom du fabricant \n(Structure)">Nouveau fournisseur</label>
                    <input
                      type="text"
                      name="Nom du fabricant \n(Structure)"
                      id="Nom du fabricant \n(Structure)"
                      {...dataId('modificationRequest-Nom du fabricant \n(Structure)Field')}
                    />
                  </div>
                  <div>
                    <h3 style={{ marginTop: 15 }}>Dispositifs de stockage de l’énergie</h3>
                    <label>Ancien fournisseur</label>
                    <input
                      type="text"
                      disabled
                      defaultValue={
                        project.details?.[
                          'Nom du fabricant \n(Dispositifs de stockage de l’énergie *)'
                        ]
                      }
                    />
                    <label htmlFor="Nom du fabricant \n(Dispositifs de stockage de l’énergie *)">
                      Nouveau fournisseur
                    </label>
                    <input
                      type="text"
                      name="Nom du fabricant \n(Dispositifs de stockage de l’énergie *)"
                      id="Nom du fabricant \n(Dispositifs de stockage de l’énergie *)"
                      {...dataId(
                        'modificationRequest-Nom du fabricant \n(Dispositifs de stockage de l’énergie *)Field'
                      )}
                    />
                  </div>
                  <div>
                    <h3 style={{ marginTop: 15 }}>Dispositifs de suivi de la course du soleil</h3>
                    <label>Ancien fournisseur</label>
                    <input
                      type="text"
                      disabled
                      defaultValue={
                        project.details?.[
                          'Nom du fabricant \n(Dispositifs de suivi de la course du soleil *)'
                        ]
                      }
                    />
                    <label htmlFor="Nom du fabricant \n(Dispositifs de suivi de la course du soleil *)">
                      Nouveau fournisseur
                    </label>
                    <input
                      type="text"
                      name="Nom du fabricant \n(Dispositifs de suivi de la course du soleil *)"
                      id="Nom du fabricant \n(Dispositifs de suivi de la course du soleil *)"
                      {...dataId(
                        'modificationRequest-Nom du fabricant \n(Dispositifs de suivi de la course du soleil *)Field'
                      )}
                    />
                  </div>
                  <div>
                    <h3 style={{ marginTop: 15 }}>Autres technologies</h3>
                    <label>Ancien fournisseur</label>
                    <input
                      type="text"
                      disabled
                      defaultValue={project.details?.['Nom du fabricant \n(Autres technologies)']}
                    />
                    <label htmlFor="Nom du fabricant \n(Autres technologies)">
                      Nouveau fournisseur
                    </label>
                    <input
                      type="text"
                      name="Nom du fabricant \n(Autres technologies)"
                      id="Nom du fabricant \n(Autres technologies)"
                      {...dataId(
                        'modificationRequest-Nom du fabricant \n(Autres technologies)Field'
                      )}
                    />
                  </div>

                  {project.evaluationCarbone > 0 && (
                    <div>
                      <h3 style={{ marginTop: 15 }}>Evaluation carbone</h3>
                      <label>Ancienne évaluation carbone (kg eq CO2/kWc)</label>
                      <input
                        type="text"
                        disabled
                        defaultValue={project.evaluationCarbone}
                        {...dataId('modificationRequest-oldEvaluationCarboneField')}
                      />
                      <label htmlFor="evaluationCarbone">
                        Nouvelle évaluation carbone (kg eq CO2/kWc)
                      </label>
                      <input
                        type="text"
                        name="evaluationCarbone"
                        id="evaluationCarbone"
                        {...dataId('modificationRequest-evaluationCarboneField')}
                      />
                    </div>
                  )}

                  <div
                    className="notification warning"
                    style={{ display: 'none' }}
                    {...dataId('modificationRequest-evaluationCarbone-error-message-out-of-bounds')}
                  >
                    Cette nouvelle valeur entraîne une dégradation de la note du projet, celui-ci ne
                    recevra pas d'attestation de conformité.
                  </div>
                  <div
                    className="notification error"
                    style={{ display: 'none' }}
                    {...dataId('modificationRequest-evaluationCarbone-error-message-wrong-format')}
                  >
                    Le format saisi n’est pas conforme (si l'évaluation carbone est un nombre
                    décimal, pensez à utiliser un point au lieu de la virgule).
                  </div>

                  <label htmlFor="candidats" style={{ marginTop: 15 }}>
                    Pièce-jointe
                  </label>
                  <input
                    type="file"
                    name="file"
                    {...dataId('modificationRequest-fileField')}
                    id="file"
                  />
                  <label style={{ marginTop: 10 }} className="required" htmlFor="justification">
                    <strong>
                      Veuillez nous indiquer les raisons qui motivent cette modification
                    </strong>
                    <br />
                    Pour faciliter le traitement de votre demande, veillez à détailler les raisons
                    ayant conduit à ce besoin de modification (contexte, facteurs extérieurs, etc)
                  </label>
                  <textarea
                    name="justification"
                    id="justification"
                    defaultValue={justification || ''}
                    {...dataId('modificationRequest-justificationField')}
                  />
                </>
              ) : (
                ''
              )}
              {action === 'producteur' ? (
                <>
                  <label>Ancien producteur</label>
                  <input type="text" disabled defaultValue={project.nomCandidat} />
                  <div className="notification warning" style={{ marginTop: 10, marginBottom: 10 }}>
                    <span>
                      Attention : de nouvelles garanties financières devront être déposées d'ici un
                      mois
                    </span>
                  </div>
                  <label className="required" htmlFor="producteur">
                    Nouveau producteur
                  </label>
                  <input
                    type="text"
                    name="producteur"
                    id="producteur"
                    {...dataId('modificationRequest-producteurField')}
                  />
                  <label htmlFor="candidats">Statuts mis à jour</label>
                  <input
                    type="file"
                    name="file"
                    {...dataId('modificationRequest-fileField')}
                    id="file"
                  />
                  <label style={{ marginTop: 10 }} className="required" htmlFor="justification">
                    <strong>
                      Veuillez nous indiquer les raisons qui motivent cette modification
                    </strong>
                    <br />
                    Pour faciliter le traitement de votre demande, veillez à détailler les raisons
                    ayant conduit à ce besoin de modification (contexte, facteurs extérieurs, etc)
                  </label>
                  <textarea
                    name="justification"
                    id="justification"
                    defaultValue={justification || ''}
                    {...dataId('modificationRequest-justificationField')}
                  />
                </>
              ) : (
                ''
              )}
              {action === 'actionnaire' ? (
                <>
                  <label>Ancien actionnaire</label>
                  <input type="text" disabled defaultValue={project.actionnaire} />
                  <label className="required" htmlFor="actionnaire">
                    Nouvel actionnaire
                  </label>
                  <input
                    type="text"
                    name="actionnaire"
                    id="actionnaire"
                    defaultValue={actionnaire || ''}
                    {...dataId('modificationRequest-actionnaireField')}
                  />
                  <label htmlFor="candidats">Statuts mis à jour</label>
                  <input
                    type="file"
                    name="file"
                    {...dataId('modificationRequest-fileField')}
                    id="file"
                  />
                  <label style={{ marginTop: 10 }} className="required" htmlFor="justification">
                    <strong>
                      Veuillez nous indiquer les raisons qui motivent cette modification
                    </strong>
                    <br />
                    Pour faciliter le traitement de votre demande, veillez à détailler les raisons
                    ayant conduit à ce besoin de modification (contexte, facteurs extérieurs, etc)
                  </label>
                  <textarea
                    name="justification"
                    id="justification"
                    defaultValue={justification || ''}
                    {...dataId('modificationRequest-justificationField')}
                  />
                </>
              ) : (
                ''
              )}
              {action === 'abandon' ? (
                <>
                  <label className="required" htmlFor="justification">
                    <strong>Veuillez nous indiquer les raisons qui motivent votre demande</strong>
                    <br />
                    Pour faciliter le traitement de votre demande, veillez à détailler les raisons
                    ayant conduit à ce besoin de modification (contexte, facteurs extérieurs, etc)
                  </label>
                  <textarea
                    name="justification"
                    id="justification"
                    defaultValue={justification || ''}
                    {...dataId('modificationRequest-justificationField')}
                  />
                  <label htmlFor="candidats">Pièce justificative</label>
                  <input
                    type="file"
                    name="file"
                    {...dataId('modificationRequest-fileField')}
                    id="file"
                  />
                </>
              ) : (
                ''
              )}
              {action === 'recours' ? (
                <>
                  <label className="required" htmlFor="justification">
                    <strong>Veuillez nous indiquer les raisons qui motivent votre demande</strong>
                    <br />
                    Pour faciliter le traitement de votre demande, veillez à détailler les raisons
                    ayant conduit à ce besoin de modification (contexte, facteurs extérieurs, etc)
                  </label>
                  <textarea
                    name="justification"
                    id="justification"
                    defaultValue={justification || ''}
                    {...dataId('modificationRequest-justificationField')}
                  />
                  <label htmlFor="candidats">Pièce justificative (si nécessaire)</label>
                  <input
                    type="file"
                    name="file"
                    {...dataId('modificationRequest-fileField')}
                    id="file"
                  />
                </>
              ) : (
                ''
              )}
              {action === 'delai' ? (
                <>
                  <label>Date théorique de mise en service</label>
                  <input
                    type="text"
                    disabled
                    defaultValue={formatDate(
                      +moment(project.notifiedOn).add(
                        getDelayForAppelOffre(project.appelOffreId),
                        'months'
                      ),
                      'DD/MM/YYYY'
                    )}
                    {...dataId('modificationRequest-presentServiceDateField')}
                  />
                  <label style={{ marginTop: 5 }} className="required" htmlFor="delayedServiceDate">
                    Durée du délai en mois
                  </label>
                  <input
                    type="number"
                    name="delayInMonths"
                    id="delayInMonths"
                    defaultValue={delayInMonths}
                    data-initial-date={moment(project.notifiedOn)
                      .add(getDelayForAppelOffre(project.appelOffreId), 'months')
                      .toDate()
                      .getTime()}
                    {...dataId('delayInMonthsField')}
                  />
                  <div style={{ fontSize: 11 }} {...dataId('delayEstimateBox')}></div>
                  <label style={{ marginTop: 10 }} className="required" htmlFor="justification">
                    <strong>Veuillez nous indiquer les raisons qui motivent votre demande</strong>
                    <br />
                    Pour faciliter le traitement de votre demande, veillez à détailler les raisons
                    ayant conduit à ce besoin de modification (contexte, facteurs extérieurs, etc)
                  </label>
                  <textarea
                    name="justification"
                    id="justification"
                    defaultValue={justification || ''}
                    {...dataId('modificationRequest-justificationField')}
                  />
                  {!(project.dcrNumeroDossier || project.numeroGestionnaire) ? (
                    <>
                      <label htmlFor="numeroGestionnaire" style={{ marginTop: 5 }}>
                        Identifiant gestionnaire de réseau
                      </label>
                      <div style={{ fontSize: 11 }}>
                        Cette indication permettra un traitement plus rapide de votre demande.{' '}
                        <a href="https://docs.potentiel.beta.gouv.fr/info/guide-dutilisation-potentiel/comment-transmettre-ma-demande-complete-de-raccordement-dcr">
                          Où trouver mon numéro ?
                        </a>
                      </div>
                      <input
                        type="text"
                        name="numeroGestionnaire"
                        {...dataId('modificationRequest-numeroGestionnaireField')}
                        id="numeroGestionnaire"
                      />
                    </>
                  ) : null}
                  <label htmlFor="file" style={{ marginTop: 5 }}>
                    Pièce justificative (si nécessaire)
                  </label>
                  <input
                    type="file"
                    name="file"
                    {...dataId('modificationRequest-fileField')}
                    id="file"
                  />
                </>
              ) : (
                ''
              )}

              {actionShouldBeDisabled && (
                <div className="notification error" style={{ marginTop: 10, marginBottom: 10 }}>
                  Le dépôt de demande sera de nouveau disponible dès la mise en vigueur des
                  nouvelles règles des cahiers des charges, au plus tard le 31 Juillet 2021.
                </div>
              )}

              <button
                className="button"
                type="submit"
                name="submit"
                id="submit"
                {...dataId('submit-button')}
                disabled={actionShouldBeDisabled}
              >
                Envoyer
              </button>
              <a
                className="button-outline primary"
                {...dataId('cancel-button')}
                href={ROUTES.USER_LIST_PROJECTS}
              >
                Annuler
              </a>
            </div>
          </div>
        </form>
      </div>
    </UserDashboard>
  )
}
