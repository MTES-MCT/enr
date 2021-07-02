import { Result, Ok, ErrorResult } from '../types'
import { Runtype } from '../types/schemaTypes'
import { Optional } from 'utility-types'
import _ from 'lodash'
import { logger } from '../core/utils'

interface HasId {
  id: string
}

const buildMakeEntity = <T extends HasId>(
  schema: Runtype<T>,
  makeId: () => string,
  typeFields: Array<string>,
  defaults?: Record<string, any>
) => {
  // Make a small utility to remove all unnecessary fields
  const extractTypeFields = (obj: any) => _.pick(obj, typeFields)

  // The input object doesn't require an id
  return (obj: Optional<T, 'id'>): Result<T, Error> => {
    // Extract fields that are not in the type
    const onlyTypeFields = extractTypeFields(obj)

    // Add an id if there is none
    if (!onlyTypeFields.id) {
      onlyTypeFields.id = makeId()
    }

    if (defaults) {
      Object.entries(defaults).forEach(([key, value]) => {
        if (typeof obj[key] !== 'undefined') return

        if (typeof value === 'function') {
          // apply this to the key
          onlyTypeFields[key] = value(onlyTypeFields[key])
        } else {
          // Insert the default value
          onlyTypeFields[key] = value
        }
      })
    }

    try {
      return Ok(schema.check(onlyTypeFields))
    } catch (error) {
      logger.error(error)
      return ErrorResult(`${error.message} in field ${error.key}`)
    }
  }
}

export default buildMakeEntity
