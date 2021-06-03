import { RequiredActionAlias } from 'keycloak-admin/lib/defs/requiredActionProviderRepresentation'
import { logger, ResultAsync, wrapInfra } from '../../core/utils'
import { User } from '../../entities'
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

export const createUserCredentials = (args: { role: User['role']; email: string }) => {
  const { email, role } = args

  async function createKeyCloakCredentials(): Promise<string> {
    await keycloakAdminClient.auth({
      grantType: 'client_credentials',
      clientId: KEYCLOAK_ADMIN_CLIENT_ID!,
      clientSecret: KEYCLOAK_ADMIN_CLIENT_SECRET,
    })

    const { id } = await keycloakAdminClient.users.create({
      realm: KEYCLOAK_REALM,
      username: email,
      enabled: true,
      email,
      // requiredActions: [RequiredActionAlias.UPDATE_PASSWORD],
    })

    await keycloakAdminClient.users.executeActionsEmail({
      id,
      clientId: KEYCLOAK_USER_CLIENT_ID,
      actions: [RequiredActionAlias.UPDATE_PASSWORD, RequiredActionAlias.VERIFY_EMAIL],
      realm: KEYCLOAK_REALM,
      redirectUri: BASE_URL + routes.REGISTRATION_CALLBACK,
    })

    const realmRole = await keycloakAdminClient.roles.findOneByName({ name: role })
    if (!realmRole || !realmRole.id) {
      throw new Error(`Cannot find realmRole for ${role}`)
    }

    await keycloakAdminClient.users.addRealmRoleMappings({
      id,
      roles: [{ id: realmRole.id, name: realmRole.name! }],
    })

    return id
  }

  return ResultAsync.fromPromise(createKeyCloakCredentials(), (e: any) => {
    logger.error(e)
    return new OtherError(e.message)
  })
}
