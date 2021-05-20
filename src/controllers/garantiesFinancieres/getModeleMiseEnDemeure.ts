import moment from 'moment'
import os from 'os'
import path from 'path'
import sanitize from 'sanitize-filename'
import { userRepo } from '../../dataAccess'
import { makeProjectIdentifier } from '../../entities/project'
import { fillDocxTemplate } from '../../helpers/fillDocxTemplate'
import { formatDate } from '../../helpers/formatDate'
import routes from '../../routes'
import { getUserProject } from '../../useCases'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'
import asyncHandler from 'express-async-handler'

v1Router.get(
  routes.TELECHARGER_MODELE_MISE_EN_DEMEURE(),
  ensureRole('dreal'),
  asyncHandler(async (request, response) => {
    const { projectId } = request.params

    // Verify that the current user has the rights to check this out
    const project = await getUserProject({ user: request.user, projectId })

    if (!project) {
      return response.status(404).send('Impossible de générer le fichier demandé.')
    }

    const filepath = path.join(
      os.tmpdir(),
      sanitize(`Mise en demeure Garanties Financières - ${project.nomProjet}.docx`)
    )

    // Get the user's dreal region(s)
    const userDreals = await userRepo.findDrealsForUser(request.user.id)

    // If there are multiple, use the first to coincide with the project
    const dreal = userDreals.find((dreal) => project.regionProjet.includes(dreal))

    if (!dreal) {
      return response.status(403).send('Impossible de générer le fichier demandé.')
    }

    const templatePath = path.resolve(
      __dirname,
      '../..',
      'views',
      'template',
      'Modèle mise en demeure v2.docx'
    )

    const imageToInject = path.resolve(__dirname, '../../public/images/dreals', `${dreal}.png`)

    await fillDocxTemplate({
      templatePath,
      outputPath: filepath,
      injectImage: imageToInject,
      variables: {
        dreal,
        dateMiseEnDemeure: formatDate(Date.now()),
        contactDreal: request.user.email,
        referenceProjet: makeProjectIdentifier(project),
        titreAppelOffre: project.appelOffre?.title || '!!!AO NON DISPONIBLE!!!',
        dateLancementAppelOffre: project.appelOffre?.launchDate || '!!!AO NON DISPONIBLE!!!',
        nomProjet: project.nomProjet,
        adresseCompleteProjet: `${project.adresseProjet} ${project.codePostalProjet} ${project.communeProjet}`,
        puissanceProjet: project.puissance.toString(),
        unitePuissance: project.appelOffre?.unitePuissance || '!!!AO NON DISPONIBLE!!!',
        titrePeriode: project.appelOffre?.periode?.title || '!!!AO NON DISPONIBLE!!!',
        dateNotification: formatDate(project.notifiedOn),
        paragrapheGF:
          project.appelOffre?.renvoiRetraitDesignationGarantieFinancieres ||
          '!!!AO NON DISPONIBLE!!!',
        garantieFinanciereEnMois:
          project.famille?.garantieFinanciereEnMois?.toString() || '!!!FAMILLE NON DISPONIBLE!!!',
        dateFinGarantieFinanciere: project.famille
          ? formatDate(
              moment(project.notifiedOn)
                .add(project.famille.garantieFinanciereEnMois, 'months')
                .toDate()
                .getTime()
            )
          : '!!!FAMILLE NON DISPONIBLE!!!',
        dateLimiteDepotGF: formatDate(project.garantiesFinancieresDueOn),
        nomRepresentantLegal: project.nomRepresentantLegal,
        adresseProjet: project.adresseProjet,
        codePostalProjet: project.codePostalProjet,
        communeProjet: project.communeProjet,
        emailProjet: project.email,
      },
    })

    return response.sendFile(path.resolve(process.cwd(), filepath))
  })
)
