import { logger } from '../../../core/utils'
import { userRepo } from '../../../dataAccess'
import { makeUser, User } from '../../../entities'

interface CreateUserProps {
  email: User['email']
  fullName: User['fullName']
  password: string
  role: User['role']
}

async function createUser({ email, fullName, password, role }: CreateUserProps) {
  // Create a user object
  const userResult = makeUser({
    fullName,
    email,
    role,
    isRegistered: true,
  })
  if (userResult.is_err()) {
    logger.error(userResult.unwrap_err())
    return
  }
  const user = userResult.unwrap()

  // Insert the user in the database
  const userInsertion = await userRepo.insert(user)

  if (userInsertion.is_err()) {
    logger.error(userInsertion.unwrap_err())
    logger.info(user)
    return
  }

  return user.id
}

export { createUser }
