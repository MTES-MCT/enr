import { v4 as uuidv4 } from 'uuid'
import buildMakeModificationRequest from './modificationRequest'
import buildMakeProject, { buildApplyProjectUpdate } from './project'
import buildMakeUser from './user'

const makeId = uuidv4

const makeUser = buildMakeUser({ makeId })
const makeProject = buildMakeProject({ makeId })
const applyProjectUpdate = buildApplyProjectUpdate(makeId)
const makeModificationRequest = buildMakeModificationRequest({ makeId })

export * from './appelOffre'
export * from './dreal'
export * from './famille'
export * from './modificationRequest'
export * from './periode'
export * from './project'
export * from './user'
export { makeUser, makeProject, makeModificationRequest, applyProjectUpdate }
