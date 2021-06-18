import { sequelizeInstance } from '../../sequelize.config'

import { MakeProjectModel } from './projections/project/project.model'
import { MakeFileModel } from './projections/file/file.model'
import { MakeNotificationModel } from './projections/notification/notification.model'
import { MakeEventStoreModel } from './eventStore/eventStore.model'
import { MakeUserModel } from './projections/user/user.model'
import { MakeProjectStepModel } from './projections/projectStep/projectStep.model'

import { MakeUserProjectsModel } from './projections/userProjects/userProjects.model'
import { MakeProjectAdmissionKeyModel } from './projections/projectAdmissionKey/projectAdmissionKey.model'
import { MakeModificationRequestModel } from './projections/modificationRequest/modificationRequest.model'
import { MakeAppelOffreModel } from './projections/appelOffre/appelOffre.model'
import { MakePeriodeModel } from './projections/appelOffre/periode.model'
import { MakeUserDrealModel } from './projections/userDreal/userDreal.model'
import { EventBus } from '../../modules/eventStore'

export const models = {
  File: MakeFileModel(sequelizeInstance),
  Notification: MakeNotificationModel(sequelizeInstance),
  Project: MakeProjectModel(sequelizeInstance),
  EventStore: MakeEventStoreModel(sequelizeInstance),
  ModificationRequest: MakeModificationRequestModel(sequelizeInstance),
  User: MakeUserModel(sequelizeInstance),
  UserProjects: MakeUserProjectsModel(sequelizeInstance),
  ProjectAdmissionKey: MakeProjectAdmissionKeyModel(sequelizeInstance),
  ProjectStep: MakeProjectStepModel(sequelizeInstance),
  AppelOffre: MakeAppelOffreModel(sequelizeInstance),
  Periode: MakePeriodeModel(sequelizeInstance),
  UserDreal: MakeUserDrealModel(sequelizeInstance),
}

// Link projectors with the eventBus (called by the application config)
export const initProjectors = (eventBus: EventBus) => {
  const initializedProjectors: string[] = []
  Object.values(models).forEach((model) => {
    if (model.projector) {
      model.projector.initEventBus(eventBus)
      initializedProjectors.push(model.getTableName())
    }
  })

  return initializedProjectors
}

// Create associations and link projectors to their model
Object.values(models).forEach((model) => {
  model.associate(models)
  if (model.projector) model.projector.initModel(model)
})

export default models
