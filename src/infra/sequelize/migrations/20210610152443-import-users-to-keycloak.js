'use strict';

const uuid = require('uuid')
const { requiredAction, default: KeycloakAdmin } = require('keycloak-admin');

const {
  NODE_ENV,
  BASE_URL,
  KEYCLOAK_SERVER,
  KEYCLOAK_REALM,
  KEYCLOAK_ADMIN_CLIENT_ID,
  KEYCLOAK_ADMIN_CLIENT_SECRET,
  KEYCLOAK_USER_CLIENT_ID,
  KEYCLOAK_USER_CLIENT_SECRET,
} = process.env

if(NODE_ENV !== 'test'){
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
}


module.exports = {
  up: async (queryInterface, Sequelize) => {

    if(NODE_ENV === "test"){
      console.log('test environnement => skipping')
      return
    }

    const keycloakAdminClient = new KeycloakAdmin({
      baseUrl: KEYCLOAK_SERVER,
      realmName: KEYCLOAK_REALM,
    })

    const transaction = await queryInterface.sequelize.transaction()
    try{

      await keycloakAdminClient.auth({
        grantType: 'client_credentials',
        clientId: KEYCLOAK_ADMIN_CLIENT_ID,
        clientSecret: KEYCLOAK_ADMIN_CLIENT_SECRET,
      })

      const nonKeycloakUsers = await queryInterface.sequelize.query(
        'SELECT * FROM "users" WHERE "keycloakId" IS NULL',
        {
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction,
        }
      )

      for (const user of nonKeycloakUsers) {

        const { id, email, role, fullName, createdAt, projectAdmissionKey } = user

        console.log('Creating keycloak account for', email)

        const { id: keycloakId } = await keycloakAdminClient.users.create({
          realm: KEYCLOAK_REALM,
          username: email,
          enabled: true,
          email,
          emailVerified: true,
          lastName: fullName,
          requiredActions: [requiredAction.UPDATE_PASSWORD],
        })

        const realmRole = await keycloakAdminClient.roles.findOneByName({ name: role })

        if (!realmRole || !realmRole.id) {
          throw new Error(`Keycloak could not find role ${role}`)
        } else {
          await keycloakAdminClient.users.addRealmRoleMappings({
            id: keycloakId,
            roles: [{ id: realmRole.id, name: realmRole.name }],
          })
          // console.log(`Keycloak added role ${role} to user ${email}`)
        }

        if(NODE_ENV === 'production'){
          await keycloakAdminClient.users.sendVerifyEmail({
            id: keycloakId,
            clientId: KEYCLOAK_USER_CLIENT_ID,
            realm: KEYCLOAK_REALM,
            redirectUri: BASE_URL + '/go-to-user-dashboard'
          })
        }

        await queryInterface.bulkInsert(
          'eventStores',
          [
            {
              id: uuid.v4(),
              type: 'LegacyUserCreated',
              payload: JSON.stringify({
                userId: id,
                keycloakId,
                email,
                role,
                fullName,
                projectAdmissionKey,
              }),
              version: 1,
              aggregateId: [id],
              occurredAt: new Date(createdAt),
              createdAt: new Date(createdAt),
              updatedAt: new Date(createdAt),
            },
          ],
          { transaction }
        )

        await queryInterface.sequelize.query(
          'UPDATE "users" SET "keycloakId" = ? WHERE id = ?',
          {
            replacements: [keycloakId, id],
            transaction,
          }
        )
      }

      await transaction.commit()
    }
    catch(err){
      console.log(err)
      await transaction.rollback()
      throw err
    }
  },

  down: async (queryInterface, Sequelize) => {
  }
};
