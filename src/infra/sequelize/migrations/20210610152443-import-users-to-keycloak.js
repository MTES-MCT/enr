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
  AUTHORIZED_TEST_EMAILS
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

const authorizedTestEmails = AUTHORIZED_TEST_EMAILS?.split(',') || []

const ONE_MONTH = 3600 * 24 * 30

module.exports = {
  up: async (queryInterface, Sequelize) => {

    if(NODE_ENV === "test" || NODE_ENV === "development"){
      console.log('test/dev environnement => skipping')
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

      const users = await queryInterface.sequelize.query(
        'SELECT * FROM "users"',
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        }
      )

      for (const user of users) {

        const { id, email, role, fullName, createdAt, projectAdmissionKey } = user

        const usersWithEmail = await keycloakAdminClient.users.find({ email, realm: KEYCLOAK_REALM })

        let keycloakId = usersWithEmail.length ? usersWithEmail[0].id : undefined

        if(!keycloakId){
          console.log('Creating keycloak account for', email)
          const newUser = await keycloakAdminClient.users.create({
            realm: KEYCLOAK_REALM,
            username: email,
            enabled: true,
            email,
            emailVerified: true,
            lastName: fullName,
            requiredActions: [requiredAction.UPDATE_PASSWORD],
          })

          keycloakId = newUser.id

          if(NODE_ENV === 'production' || authorizedTestEmails.includes(email)){
            try{
              await keycloakAdminClient.users.executeActionsEmail({
                id: keycloakId,
                clientId: KEYCLOAK_USER_CLIENT_ID,
                actions: [requiredAction.UPDATE_PASSWORD],
                realm: KEYCLOAK_REALM,
                redirectUri: BASE_URL + '/go-to-user-dashboard',
                lifespan: ONE_MONTH,
              })
            }
            catch(e){
              console.log('Failed to send executeActions email (no email configured in realm ?')
            }
          }
          else{
            console.log(`executeActionsEmail prevented on ${email} because not in authorizedTestEmails`)
          }
        }
        else{
          console.log(`${email} already has a keycloak account.`)
        }

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
