import { DataTypes, Op } from 'sequelize'
import moment from 'moment'
import { ProjectAdmissionKeyRepo } from '../'
import { ProjectAdmissionKey, makeProjectAdmissionKey } from '../../entities'
import { mapExceptError, mapIfOk } from '../../helpers/results'
import {
  Err,
  None,
  Ok,
  OptionAsync,
  ResultAsync,
  Some,
  Pagination,
  PaginatedList,
} from '../../types'
import { paginate, pageCount, makePaginatedList } from '../../helpers/paginate'
import CONFIG from '../config'
import isDbReady from './helpers/isDbReady'

// Override these to apply serialization/deserialization on inputs/outputs
const deserialize = (item) => ({
  ...item,
  projectId: item.projectId || undefined,
  dreal: item.dreal || undefined,
  lastUsedAt: item.lastUsedAt || undefined,
  createdAt: item.createdAt.getTime(),
})
const serialize = (item) => item

export default function makeProjectAdmissionKeyRepo({
  sequelize,
}): ProjectAdmissionKeyRepo {
  const ProjectAdmissionKeyModel = sequelize.define('projectAdmissionKey', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dreal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastUsedAt: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
  })

  const _isDbReady = isDbReady({ sequelize })

  return Object.freeze({
    findById,
    findAll,
    save,
  })

  async function findById(
    id: ProjectAdmissionKey['id']
  ): OptionAsync<ProjectAdmissionKey> {
    await _isDbReady

    try {
      const projectAdmissionKeyInDb = await ProjectAdmissionKeyModel.findByPk(
        id
      )

      if (!projectAdmissionKeyInDb) return None

      const projectAdmissionKeyInstance = makeProjectAdmissionKey(
        deserialize(projectAdmissionKeyInDb.get())
      )

      if (projectAdmissionKeyInstance.is_err())
        throw projectAdmissionKeyInstance.unwrap_err()

      return Some(projectAdmissionKeyInstance.unwrap())
    } catch (error) {
      if (CONFIG.logDbErrors)
        console.log('ProjectAdmissionKey.findById error', error)
      return None
    }
  }

  async function findAll(
    query?: Record<string, any>
  ): Promise<Array<ProjectAdmissionKey>>
  async function findAll(
    query: Record<string, any>,
    pagination: Pagination
  ): Promise<PaginatedList<ProjectAdmissionKey>>
  async function findAll(
    query?: Record<string, any>,
    pagination?: Pagination
  ): Promise<PaginatedList<ProjectAdmissionKey> | Array<ProjectAdmissionKey>> {
    await _isDbReady

    try {
      const opts: any = {}
      if (query) {
        opts.where = query

        if (query.dreal === -1) {
          // Special case which means not null
          opts.where.dreal = { [Op.ne]: null }
        }

        if (query.dreal === null) {
          opts.where.dreal = { [Op.eq]: null }
        }

        if (query.projectId === null) {
          opts.where.projectId = { [Op.eq]: null }
        }

        if (typeof query.createdAt === 'object' && query.createdAt.before) {
          opts.where.createdAt = {
            [Op.lte]: moment(query.createdAt.before).toDate(),
          }
        }
      }

      opts.order = [['createdAt', 'DESC']]

      if (pagination) {
        const { count, rows } = await ProjectAdmissionKeyModel.findAndCountAll({
          ...opts,
          ...paginate(pagination),
        })

        const deserializedItems = mapExceptError(
          rows.map((item) => item.get()),
          deserialize,
          'ProjectAdmissionKey.findAll.deserialize error'
        )

        return makePaginatedList(deserializedItems, pagination, count)
      }

      // No pagination
      const projectAdmissionKeysRaw = await ProjectAdmissionKeyModel.findAll(
        opts
      )

      const deserializedItems = mapExceptError(
        projectAdmissionKeysRaw.map((item) => item.get()),
        deserialize,
        'ProjectAdmissionKey.findAll.deserialize error'
      )

      return mapIfOk(
        deserializedItems,
        makeProjectAdmissionKey,
        'ProjectAdmissionKey.findAll.makeProjectAdmissionKey error'
      )
    } catch (error) {
      if (CONFIG.logDbErrors)
        console.log('ProjectAdmissionKey.findAll error', error)
      return []
    }
  }

  async function save(
    projectAdmissionKey: ProjectAdmissionKey
  ): ResultAsync<ProjectAdmissionKey> {
    await _isDbReady

    try {
      await ProjectAdmissionKeyModel.upsert(serialize(projectAdmissionKey))
      return Ok(projectAdmissionKey)
    } catch (error) {
      if (CONFIG.logDbErrors)
        console.log('ProjectAdmissionKey.insert error', error)
      return Err(error)
    }
  }
}

export { makeProjectAdmissionKeyRepo }
