import { ModificationRequestRepo, UserRepo } from '../'
import { DREAL, ModificationRequest, Project, User } from '../../entities'
import { Err, ErrorResult, None, Ok, Some } from '../../types'
import { appelOffreRepo } from './appelOffre'

let usersById: Record<string, User> = {}
let userProjects: Record<User['id'], Array<Project['id']>> = {}
const drealUsers: Record<string, Array<User['id']>> = {}
const userRepo: UserRepo = {
  findById: (id: string) => {
    if (id in usersById) {
      return Promise.resolve(Some(usersById[id]))
    } else return Promise.resolve(None)
  },
  findAll: (query?) => {
    const allItems = Object.values(usersById)

    if (!query) {
      return Promise.resolve(allItems)
    }

    return Promise.resolve(
      allItems.filter((user) => Object.entries(query).every(([key, value]) => user[key] === value))
    )
  },
  findUsersForDreal: async (dreal: DREAL): Promise<Array<User>> => {
    if (dreal in drealUsers) {
      return drealUsers[dreal].map((userId) => usersById[userId])
    }

    return []
  },
  findDrealsForUser: async (userId: User['id']): Promise<Array<DREAL>> => {
    return Object.entries(drealUsers).reduce((drealsForUser, [dreal, drealUserList]) => {
      if (drealUserList.includes(userId)) {
        drealsForUser.push(dreal)
      }
      return drealsForUser
    }, [] as Array<string>) as Array<DREAL>
  },
  addToDreal: async (userId: User['id'], dreal: DREAL) => {
    if (!(dreal in drealUsers)) {
      drealUsers[dreal] = []
    }

    drealUsers[dreal].push(userId)

    return Ok(null)
  },
  insert: (user: User) => {
    usersById[user.id] = user

    return Promise.resolve(Ok(user))
  },
  update: (user: User) => {
    if (!user.id) {
      return Promise.resolve(Err(new Error('Cannot update user that has no id')))
    }

    if (!usersById[user.id]) {
      return Promise.resolve(Err(new Error('Cannot update user that was unknown')))
    }

    usersById[user.id] = user

    return Promise.resolve(Ok(user))
  },
  remove: async (userId: User['id']) => {
    delete usersById[userId]
    return Ok(null)
  },
  addProject: async (userId: User['id'], projectId: Project['id']) => {
    if (!userProjects[userId]) {
      userProjects[userId] = []
    }

    userProjects[userId].push(projectId)
    return Ok(null)
  },
  hasProject: async (userId: User['id'], projectId: Project['id']) => {
    if (!userProjects[userId]) {
      return false
    }

    return userProjects[userId].includes(projectId)
  },
  addUserToProjectsWithEmail: async (userId: User['id'], email: Project['email']) => Ok(null),
  addProjectToUserWithEmail: async (projectId: Project['id'], email: Project['email']) => Ok(null),
}

let modificationRequestsById: Record<string, ModificationRequest> = {}
const modificationRequestRepo: ModificationRequestRepo = {
  findById: async (id: string) => {
    if (id in modificationRequestsById) {
      return Some(modificationRequestsById[id])
    } else return None
  },
  findAll: async (query?) => {
    const allItems = Object.values(modificationRequestsById)

    if (!query) {
      return allItems
    }

    return allItems.filter((item) =>
      Object.entries(query).every(([key, value]) => item[key] === value)
    )
  },
  insert: async (item: ModificationRequest) => {
    modificationRequestsById[item.id] = item

    return Ok(item)
  },
  update: async (item: ModificationRequest) => {
    if (!item.id) {
      return ErrorResult('Cannot update item that has no id')
    }

    if (!modificationRequestsById[item.id]) {
      return ErrorResult('Cannot update item that was unknown')
    }

    modificationRequestsById[item.id] = item

    return Ok(item)
  },
}

const resetDatabase = () => {
  usersById = {}
  userProjects = {}
  modificationRequestsById = {}
}

export * from './appelOffre'
export { userRepo, modificationRequestRepo, appelOffreRepo, resetDatabase }
