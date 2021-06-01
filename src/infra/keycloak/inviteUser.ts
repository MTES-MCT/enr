import { RequiredActionAlias } from 'keycloak-admin/lib/defs/requiredActionProviderRepresentation'
import { User } from '../../entities'
import routes from '../../routes'
import { keycloakAdminClient } from './keycloakClient'

const {
  KEYCLOAK_ADMIN_CLIENT_ID,
  KEYCLOAK_USER_CLIENT_ID,
  KEYCLOAK_USER_CLIENT_SECRET,
  KEYCLOAK_ADMIN_CLIENT_SECRET,
  KEYCLOAK_REALM,
  BASE_URL,
} = process.env

if (!KEYCLOAK_ADMIN_CLIENT_ID || !KEYCLOAK_ADMIN_CLIENT_SECRET) {
  console.error('Missing KEYCLOAK env vars')
  process.exit(1)
}

interface InviteUserProps {
  email: string
  role: User['role']
}
export const inviteUser = async ({ email, role }: InviteUserProps) => {
  try {
    await keycloakAdminClient.auth({
      grantType: 'client_credentials',
      clientId: KEYCLOAK_ADMIN_CLIENT_ID,
      clientSecret: KEYCLOAK_ADMIN_CLIENT_SECRET,
    })

    // console.log(
    //   'found role',
    //   await keycloakAdminClient.roles.findOneByName({
    //     name: 'porteur-projet',
    //   })
    // )

    // console.log('user count', await keycloakAdminClient.users.count())
    const { id } = await keycloakAdminClient.users.create({
      realm: KEYCLOAK_REALM,
      username: email,
      enabled: true,
      email,
      requiredActions: [RequiredActionAlias.UPDATE_PASSWORD, RequiredActionAlias.VERIFY_EMAIL],
    })

    console.log(`Keycloak user created for ${email} and id ${id}`)

    // TODO: make this work with ADMIN_CLIENT
    // await keycloakAdminClient.users.executeActionsEmail({
    //   id,
    //   clientId: KEYCLOAK_USER_CLIENT_ID,
    //   actions: [RequiredActionAlias.UPDATE_PASSWORD, RequiredActionAlias.VERIFY_EMAIL],
    //   realm: KEYCLOAK_REALM,
    //   redirectUri: BASE_URL + routes.REDIRECT_BASED_ON_ROLE, // TODO: create post-signup entry-point
    // })
    await keycloakAdminClient.users.sendVerifyEmail({
      id,
      clientId: KEYCLOAK_USER_CLIENT_ID,
      realm: KEYCLOAK_REALM,
      redirectUri: BASE_URL + routes.REDIRECT_BASED_ON_ROLE, // TODO: create post-signup entry-point
    })
    console.log(`Keycloak verification email sent to ${email}`)

    const realmRole = await keycloakAdminClient.roles.findOneByName({ name: role })

    if (!realmRole || !realmRole.id) {
      console.error(`Keycloak could not find role ${role}`)
    } else {
      await keycloakAdminClient.users.addRealmRoleMappings({
        id,
        roles: [{ id: realmRole.id, name: realmRole.name! }],
      })
      console.log(`Keycloak added role ${role} to user ${email}`)
    }
  } catch (e) {
    console.error('keycloak errored', e)
  }
}
