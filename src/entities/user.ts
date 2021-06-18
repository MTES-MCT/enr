import isEmail from 'isemail'
import buildMakeEntity from '../helpers/buildMakeEntity'
import { Boolean, Literal, Record, Static, String, Union } from '../types/schemaTypes'

export const USER_ROLES = [
  'admin',
  'dgec',
  'porteur-projet',
  'dreal',
  'acheteur-obligé',
  'ademe',
] as const

const userSchema = Record({
  id: String,
  fullName: String,
  email: String.withConstraint(isEmail.validate),
  role: Union(
    Literal('admin'),
    Literal('dgec'),
    Literal('porteur-projet'),
    Literal('dreal'),
    Literal('acheteur-obligé'),
    Literal('ademe')
  ),
  isRegistered: Boolean,
})

const fields: string[] = [...Object.keys(userSchema.fields)]

type User = Static<typeof userSchema>

interface MakeUserDependencies {
  makeId: () => string
}

export default ({ makeId }: MakeUserDependencies) =>
  buildMakeEntity<User>(userSchema, makeId, fields)

export { User, userSchema }
