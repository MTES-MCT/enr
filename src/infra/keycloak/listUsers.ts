import { keycloakAdminClient } from './keycloakClient'

const { KEYCLOAK_ADMIN_CLIENT_ID, KEYCLOAK_ADMIN_CLIENT_SECRET } = process.env

if (!KEYCLOAK_ADMIN_CLIENT_ID || !KEYCLOAK_ADMIN_CLIENT_SECRET) {
  console.error('Missing KEYCLOAK env vars')
  process.exit(1)
}

export const listUsers = async () => {
  try {
    await keycloakAdminClient.auth({
      grantType: 'client_credentials',
      clientId: KEYCLOAK_ADMIN_CLIENT_ID,
      clientSecret: KEYCLOAK_ADMIN_CLIENT_SECRET,
    })

    return await keycloakAdminClient.users.find()
  } catch (e) {
    console.error('keycloak auth failed', e)
  }
}
