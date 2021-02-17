import { Request } from 'express'
import moment from 'moment'
import React from 'react'
import { User } from '../../../../entities'
import { formatDate } from '../../../../helpers/formatDate'
import { ProjectDataForProjectPage } from '../../../../modules/project/dtos'
import ROUTES from '../../../../routes'
import { DCRForm, Frise, FriseItem, GarantiesFinancieresForm } from '../components'

interface ProjectFriseProps {
  project: ProjectDataForProjectPage
  user: User
  request: Request
}

export const ProjectFrise = ({ project, user, request }: ProjectFriseProps) => (
  <Frise displayToggle={!!project.notifiedOn && project.isClasse}>
    {project.notifiedOn ? (
      <>
        <FriseItem
          date={formatDate(project.notifiedOn, 'D MMM YYYY')}
          title="Notification des résultats"
          status="past"
          action={
            project.certificateFile
              ? {
                  title: "Télécharger l'attestation",
                  link:
                    user.role === 'porteur-projet'
                      ? ROUTES.CANDIDATE_CERTIFICATE_FOR_CANDIDATES(project)
                      : ROUTES.CANDIDATE_CERTIFICATE_FOR_ADMINS(project),
                  download: true,
                }
              : user.role === 'dreal'
              ? undefined
              : {
                  title: project.appelOffre?.periode?.isNotifiedOnPotentiel
                    ? 'Votre attestation sera disponible sous 24h'
                    : 'Attestation non disponible pour cette période',
                }
          }
        />
        {project.isClasse ? (
          <>
            {project.garantiesFinancieresDueOn ? (
              project.garantiesFinancieresSubmittedOn ? (
                // garanties financières déjà déposées
                <FriseItem
                  date={formatDate(project.garantiesFinancieresDate, 'D MMM YYYY')}
                  title="Constitution des garanties financières"
                  action={[
                    {
                      title: "Télécharger l'attestation",
                      link: project.garantiesFinancieresFile
                        ? ROUTES.DOWNLOAD_PROJECT_FILE(
                            project.garantiesFinancieresFile.id,
                            project.garantiesFinancieresFile.filename
                          )
                        : undefined,
                      download: true,
                    },
                    ...(user.role === 'porteur-projet'
                      ? [
                          {
                            title: 'Annuler le dépôt',
                            confirm:
                              "Etes-vous sur de vouloir annuler le dépôt et supprimer l'attestion jointe ?",
                            link: ROUTES.SUPPRIMER_GARANTIES_FINANCIERES_ACTION(project.id),
                          },
                        ]
                      : []),
                  ]}
                  status="past"
                />
              ) : (
                // garanties financières non-déposées
                <FriseItem
                  date={formatDate(project.garantiesFinancieresDueOn, 'D MMM YYYY')}
                  title="Constitution des garanties financières"
                  action={
                    user.role === 'dreal'
                      ? project.garantiesFinancieresDueOn.getTime() < Date.now()
                        ? {
                            title: 'Télécharger mise en demeure',
                            link: ROUTES.TELECHARGER_MODELE_MISE_EN_DEMEURE(project),
                            download: true,
                          }
                        : undefined
                      : {
                          title: "Transmettre l'attestation",
                          openHiddenContent: user.role === 'porteur-projet' ? true : undefined,
                        }
                  }
                  status="nextup"
                  hiddenContent={
                    <GarantiesFinancieresForm projectId={project.id} date={request.query.gfDate} />
                  }
                />
              )
            ) : null}
            {project.notifiedOn && project.dcrDueOn ? (
              project.dcrSubmittedOn ? (
                // DCR déjà déposée
                <FriseItem
                  date={formatDate(project.dcrDate, 'D MMM YYYY')}
                  title={`Demande complète de raccordement ${
                    project.dcrNumeroDossier ? '(Dossier ' + project.dcrNumeroDossier + ')' : ''
                  }`}
                  action={[
                    {
                      title: "Télécharger l'attestation",
                      link: project.dcrFile
                        ? ROUTES.DOWNLOAD_PROJECT_FILE(project.dcrFile.id, project.dcrFile.filename)
                        : undefined,
                      download: true,
                    },
                    ...(user.role === 'porteur-projet'
                      ? [
                          {
                            title: 'Annuler le dépôt',
                            confirm:
                              "Etes-vous sur de vouloir annuler le dépôt et supprimer l'attestion jointe ?",
                            link: ROUTES.SUPPRIMER_DCR_ACTION(project.id),
                          },
                        ]
                      : []),
                  ]}
                  status="past"
                />
              ) : (
                // DCR non-déposée
                <FriseItem
                  date={formatDate(project.dcrDueOn, 'D MMM YYYY')}
                  title="Demande complète de raccordement"
                  action={
                    user.role === 'dreal'
                      ? undefined
                      : {
                          title: 'Indiquer la date de demande',
                          openHiddenContent: user.role === 'porteur-projet' ? true : undefined,
                        }
                  }
                  status="nextup"
                  hiddenContent={<DCRForm projectId={project.id} date={request.query.dcrDate} />}
                />
              )
            ) : null}
            <FriseItem
              title="Proposition technique et financière"
              action={{ title: 'Indiquer la date de signature' }}
            />
            <FriseItem
              title="Convention de raccordement"
              action={{ title: 'Indiquer la date de signature' }}
              defaultHidden={true}
            />
            <FriseItem
              date={formatDate(
                +moment(project.notifiedOn).add(
                  project.appelOffre?.delaiRealisationEnMois,
                  'months'
                ),
                'D MMM YYYY'
              )}
              title="Attestation de conformité"
              action={{ title: "Transmettre l'attestation" }}
              defaultHidden={true}
            />
            <FriseItem
              title="Mise en service"
              action={{ title: 'Indiquer la date' }}
              defaultHidden={true}
            />
            <FriseItem
              title="Contrat d'achat"
              action={{ title: 'Indiquer la date de signature' }}
              defaultHidden={true}
            />
          </>
        ) : null}
      </>
    ) : (
      <FriseItem title="Ce projet n'a pas encore été notifié." status="nextup" />
    )}
  </Frise>
)
