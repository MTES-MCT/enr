import { Sequelize } from 'sequelize'
import path from 'path'

import { makeCredentialsRepo } from './credentials'
import { makeUserRepo } from './user'
import { makeProjectRepo } from './project'
import { makeProjectAdmissionKeyRepo } from './projectAdmissionKey'
import { makeModificationRequestRepo } from './modificationRequest'
import { makePasswordRetrievalRepo } from './passwordRetrieval'

import { appelOffreRepo } from '../inMemory/appelOffre'

export const sequelize: any =
  process.env.NODE_ENV === 'test'
    ? new Sequelize('sqlite::memory:', { logging: false })
    : new Sequelize({
        dialect: 'sqlite',
        storage: path.resolve(process.cwd(), '.db/db.sqlite'),
        logging: false,
      })

// Create repo implementations
const credentialsRepo = makeCredentialsRepo({
  sequelize,
})

const userRepo = makeUserRepo({ sequelize })

const projectRepo = makeProjectRepo({ sequelize, appelOffreRepo })

const modificationRequestRepo = makeModificationRequestRepo({ sequelize })

const passwordRetrievalRepo = makePasswordRetrievalRepo({ sequelize })

const ProjectModel = sequelize.model('project')

const projectAdmissionKeyRepo = makeProjectAdmissionKeyRepo({ sequelize })

// Set the one-to-many relationship between project and projectAdmissionKeyRepo
const ProjectAdmissionKeyModel = sequelize.model('projectAdmissionKey')
ProjectModel.hasMany(ProjectAdmissionKeyModel)
ProjectAdmissionKeyModel.belongsTo(ProjectModel, { foreignKey: 'projectId' })

// Set the many-to-many relationship between projects and users
const UserModel = sequelize.model('user')
ProjectModel.belongsToMany(UserModel, { through: 'UserProjects' })
UserModel.belongsToMany(ProjectModel, { through: 'UserProjects' })

// Set the one-to-many relationship between project and modificationRequest
const ModificationRequestModel = sequelize.model('modificationRequest')
ProjectModel.hasMany(ModificationRequestModel)
ModificationRequestModel.belongsTo(ProjectModel, { foreignKey: 'projectId' })

// Set the one-to-many relationship between user and modificationRequest
UserModel.hasMany(ModificationRequestModel)
ModificationRequestModel.belongsTo(UserModel, { foreignKey: 'userId' })

// Sync the database models
let _isDatabaseInitialized = false
const initDatabase = async () => {
  if (_isDatabaseInitialized) {
    console.log('initDatabase: db was already initialized.')
    return
  }

  try {
    await sequelize.authenticate()
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }

  if (process.env.NODE_ENV === 'test') {
    try {
      // only need to sync when test (in-memory) database
      // The db tables are created using migration scripts eitherwise
      await sequelize.sync({ force: true })
    } catch (error) {
      console.error('Unable to sync database models', error)
    }
  }

  _isDatabaseInitialized = true
}

// Sync the database models
const resetDatabase = async () => {
  try {
    await sequelize.sync({ force: true })
  } catch (error) {
    console.error('Unable to drop to the database:', error)
  }
}

const dbAccess = Object.freeze({
  userRepo,
  credentialsRepo,
  projectRepo,
  projectAdmissionKeyRepo,
  modificationRequestRepo,
  passwordRetrievalRepo,
  appelOffreRepo,
  initDatabase,
  resetDatabase,
})

export default dbAccess
export {
  userRepo,
  credentialsRepo,
  projectRepo,
  projectAdmissionKeyRepo,
  modificationRequestRepo,
  passwordRetrievalRepo,
  appelOffreRepo,
  initDatabase,
  resetDatabase,
}
