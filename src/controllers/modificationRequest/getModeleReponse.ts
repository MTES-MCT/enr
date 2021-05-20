import asyncHandler from 'express-async-handler'
import os from 'os'
import path from 'path'
import sanitize from 'sanitize-filename'
import { eventStore, getModificationRequestDataForResponseTemplate, userRepo } from '../../config'
import { ModificationRequest, User } from '../../entities'
import { fillDocxTemplate } from '../../helpers/fillDocxTemplate'
import {
  ModificationRequestDataForResponseTemplateDTO,
  ResponseTemplateDownloaded,
} from '../../modules/modificationRequest'
import { EntityNotFoundError } from '../../modules/shared'
import routes from '../../routes'
import { shouldUserAccessProject } from '../../useCases'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'

v1Router.get(
  routes.TELECHARGER_MODELE_REPONSE(),
  ensureRole(['admin', 'dgec', 'dreal']),
  asyncHandler(async (request, response) => {
    const { projectId, modificationRequestId } = request.params

    // Verify that the current user has the rights to check this out
    if (!(await shouldUserAccessProject({ user: request.user, projectId }))) {
      return response.status(403).send('Impossible de générer le fichier demandé.')
    }

    await getModificationRequestDataForResponseTemplate(modificationRequestId, request.user).match(
      async (data) => {
        if (data.status === 'envoyée') {
          await eventStore.publish(
            new ResponseTemplateDownloaded({
              payload: {
                modificationRequestId,
                downloadedBy: request.user.id,
              },
            })
          )
        }

        return response.sendFile(
          path.resolve(process.cwd(), await makeResponseTemplate(data, request.user))
        )
      },
      async (err): Promise<any> => {
        if (err instanceof EntityNotFoundError) {
          return response
            .status(404)
            .send('Impossible de générer le fichier demandé. La demande est introuvable.')
        } else {
          return response
            .status(500)
            .send(
              'Impossible de générer le fichier demandé suite à une erreur système. Merci de contacter un administrateur.'
            )
        }
      }
    )
  })
)

const TitleByType: Record<ModificationRequest['type'], string> = {
  actionnaire: 'Changement d‘actionnaire',
  fournisseur: 'Changement de fournisseur',
  producteur: 'Changement de producteur',
  puissance: 'Changement de puissance',
  recours: 'Recours gracieux',
  abandon: 'Abandon',
  delai: 'Delai',
}

const TemplateByType: Record<ModificationRequest['type'], string> = {
  actionnaire: '',
  fournisseur: '',
  producteur: '',
  puissance: 'Modèle réponse Puissance - dynamique.docx',
  recours: 'Modèle réponse Recours gracieux - dynamique.docx',
  abandon: 'Modèle réponse Abandon - dynamique.docx',
  delai: 'Modèle réponse Prolongation de délai - dynamique.docx',
}

const getTemplate = ({ type, status }: ModificationRequestDataForResponseTemplateDTO) => {
  if (type === 'abandon' && status === 'demande confirmée') {
    return 'Modèle réponse Abandon après confirmation - dynamique.docx'
  }

  return TemplateByType[type]
}

async function makeResponseTemplate(
  data: ModificationRequestDataForResponseTemplateDTO,
  user: User
): Promise<string> {
  const now = new Date()
  const filepath = path.join(
    os.tmpdir(),
    sanitize(
      `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDay() + 1} - ${
        TitleByType[data.type]
      } - ${data.refPotentiel}.docx`
    )
  )

  const templatePath = path.resolve(__dirname, '..', '..', 'views', 'template', getTemplate(data))

  let imageToInject = ''
  if (user.role === 'dreal') {
    const userDreals = await userRepo.findDrealsForUser(user.id)
    if (userDreals.length) {
      const dreal = userDreals[0]
      imageToInject = path.resolve(__dirname, '../../public/images/dreals', `${dreal}.png`)
      // @ts-ignore
      data.suiviParEmail = user.email
      // @ts-ignore
      data.dreal = dreal
    }
  }

  // If there are multiple, use the first to coincide with the project

  await fillDocxTemplate({
    templatePath,
    outputPath: filepath,
    injectImage: imageToInject,
    variables: data,
  })

  return filepath
}
