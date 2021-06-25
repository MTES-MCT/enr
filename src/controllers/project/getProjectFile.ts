import { loadFileForUser } from '../../config'
import { UniqueEntityID } from '../../core/domain'
import { FileAccessDeniedError, FileNotFoundError } from '../../modules/file'
import { InfraNotAvailableError } from '../../modules/shared'
import routes from '../../routes'
import { ensureRole } from '../auth'
import { v1Router } from '../v1Router'
import asyncHandler from 'express-async-handler'

v1Router.get(
  routes.DOWNLOAD_PROJECT_FILE(),
  ensureRole(['admin', 'dgec', 'dreal', 'porteur-projet']),
  asyncHandler(async (request, response) => {
    const { fileId } = request.params
    const { user } = request

    await loadFileForUser({
      fileId: new UniqueEntityID(fileId),
      user,
    }).match(
      async (fileStream) => {
        fileStream.contents.pipe(response)
      },
      async (e) => {
        if (e instanceof FileNotFoundError) {
          response.status(404).send('Fichier introuvable.')
        } else if (e instanceof FileAccessDeniedError) {
          response.status(403).send('Accès interdit.')
        } else if (e instanceof InfraNotAvailableError) {
          response.status(500).send('Service indisponible. Merci de réessayer.')
        }
      }
    )
  })
)
