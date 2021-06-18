import { RequiredActionAlias } from 'keycloak-admin/lib/defs/requiredActionProviderRepresentation'
import { logger, ResultAsync } from '../../core/utils'
import { OtherError } from '../../modules/shared'
import routes from '../../routes'
import { keycloakAdminClient } from './keycloakClient'

const {
  KEYCLOAK_ADMIN_CLIENT_ID,
  KEYCLOAK_USER_CLIENT_ID,
  KEYCLOAK_ADMIN_CLIENT_SECRET,
  KEYCLOAK_REALM,
  BASE_URL,
} = process.env

const ONE_MONTH = 3600 * 24 * 30

export const resendInvitationEmail = (email: string) => {
  async function createKeyCloakCredentials(): Promise<null> {
    if (!email) throw new Error('Aucune adresse mail reçue')

    await keycloakAdminClient.auth({
      grantType: 'client_credentials',
      clientId: KEYCLOAK_ADMIN_CLIENT_ID!,
      clientSecret: KEYCLOAK_ADMIN_CLIENT_SECRET,
    })

    const usersWithEmail = await keycloakAdminClient.users.find({ email, realm: KEYCLOAK_REALM })

    if (!usersWithEmail.length) {
      throw new Error('Aucun utilisateur connu sous cette adresse.')
    }

    const id = usersWithEmail[0].id!

    const fullName = usersWithEmail[0].lastName

    const actions = [RequiredActionAlias.UPDATE_PASSWORD]

    if (!fullName) actions.push(RequiredActionAlias.UPDATE_PROFILE)

    await keycloakAdminClient.users.executeActionsEmail({
      id,
      clientId: KEYCLOAK_USER_CLIENT_ID,
      actions,
      realm: KEYCLOAK_REALM,
      redirectUri: BASE_URL + routes.REGISTRATION_CALLBACK,
      lifespan: ONE_MONTH,
    })

    return null
  }

  return ResultAsync.fromPromise(createKeyCloakCredentials(), (e: any) => {
    logger.error(e)
    return new OtherError(e.message)
  })
}
