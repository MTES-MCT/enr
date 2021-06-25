import KeycloakAdmin from 'keycloak-admin'

const {
  KEYCLOAK_SERVER,
  KEYCLOAK_REALM,
  KEYCLOAK_ADMIN_CLIENT_ID,
  KEYCLOAK_ADMIN_CLIENT_SECRET,
  KEYCLOAK_USER_CLIENT_ID,
  KEYCLOAK_USER_CLIENT_SECRET,
} = process.env

if (
  !KEYCLOAK_SERVER ||
  !KEYCLOAK_REALM ||
  !KEYCLOAK_ADMIN_CLIENT_ID ||
  !KEYCLOAK_ADMIN_CLIENT_SECRET ||
  !KEYCLOAK_USER_CLIENT_ID ||
  !KEYCLOAK_USER_CLIENT_SECRET
) {
  console.error('Missing KEYCLOAK env vars')
  process.exit(1)
}

export const keycloakAdminClient = new KeycloakAdmin({
  baseUrl: KEYCLOAK_SERVER,
  realmName: KEYCLOAK_REALM,
})
