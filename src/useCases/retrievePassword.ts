import { PasswordRetrieval, makePasswordRetrieval } from '../entities'
import { PasswordRetrievalRepo, CredentialsRepo } from '../dataAccess'
import _ from 'lodash'
import { ResultAsync, ErrorResult, Ok } from '../types'
import routes from '../routes'

interface MakeUseCaseProps {
  passwordRetrievalRepo: PasswordRetrievalRepo
  credentialsRepo: CredentialsRepo
  sendPasswordResetEmail: (email: string, resetLink: string) => Promise<void>
}

interface CallUseCaseProps {
  email: string
}

export const RATE_LIMIT_REACHED =
  'Plusieurs demandes de récupération de mot de passe ont déjà été effectuées pour cette adresse. Merci de vérifier vos emails.'

export const SYSTEM_ERROR =
  "Votre demande n'a pas pu être traitée. Veuillez réessayer ou contacter un administrateur."

export default function makeRetrievePassword({
  passwordRetrievalRepo,
  credentialsRepo,
  sendPasswordResetEmail,
}: MakeUseCaseProps) {
  return async function retrievePassword({
    email,
  }: CallUseCaseProps): ResultAsync<null> {
    // Check if credentials exist
    const credentials = await credentialsRepo.findByEmail(email)

    if (credentials.is_none()) {
      console.log(
        'Forgotten password request for ' +
          email +
          ' but no account under this email.'
      )
      return Ok(null)
    }

    // Check if too many password retrievals havent been done
    const passwordRetrievalCounts = await passwordRetrievalRepo.countSince(
      email,
      Date.now() - 24 * 3600 * 1000
    )

    if (passwordRetrievalCounts >= 5) {
      return ErrorResult(RATE_LIMIT_REACHED)
    }

    const passwordRetrievalResult = makePasswordRetrieval({
      email,
      createdOn: Date.now(),
    })

    if (passwordRetrievalResult.is_err()) {
      console.log(
        'retrievePassword use-case failed to make passwordRetrievel entity',
        passwordRetrievalResult.unwrap_err()
      )
      return ErrorResult(SYSTEM_ERROR)
    }

    const passwordRetrieval = passwordRetrievalResult.unwrap()

    const insertionResult = await passwordRetrievalRepo.insert(
      passwordRetrieval
    )

    if (insertionResult.is_err()) {
      console.log(
        'retrievePassword use-case failed to insert passwordRetrievel into db',
        insertionResult.unwrap_err()
      )
      return ErrorResult(SYSTEM_ERROR)
    }

    // Send email
    await sendPasswordResetEmail(
      email,
      routes.RESET_PASSWORD_LINK({ resetCode: passwordRetrieval.id })
    )

    return Ok(null)
  }
}