import makeSignup, {
  PASSWORD_MISMATCH_ERROR,
  EMAIL_USED_ERROR,
  USER_INFO_ERROR
} from './signup'

import makeLogin from './login'

import {
  userRepo,
  credentialsRepo,
  projectAdmissionKeyRepo,
  projectRepo,
  resetDatabase
} from '../dataAccess/inMemory'
import {
  makeCredentials,
  makeProjectAdmissionKey,
  makeProject
} from '../entities'
import makeFakeProject from '../__tests__/fixtures/project'

const signup = makeSignup({
  userRepo,
  credentialsRepo,
  projectAdmissionKeyRepo,
  projectRepo
})

const login = makeLogin({
  userRepo,
  credentialsRepo
})

const makePhonySignup = (overrides = {}) => ({
  password: 'password',
  confirmPassword: 'password',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email@email.com',
  ...overrides
})

describe('signup use-case', () => {
  beforeEach(async () => {
    resetDatabase()
    const credentialsResult = makeCredentials({
      email: 'existing@email.com',
      userId: '1',
      hash: 'qsdsqdqsdqs'
    })
    expect(credentialsResult.is_ok())
    if (!credentialsResult.is_ok()) return

    await credentialsRepo.insert(credentialsResult.unwrap())
  })

  it('should create a new user with all the projects with the same email attached if user used the address the notification was sent to', async () => {
    const sameEmailEverywhere = 'one@address.com'
    // Create two fake projects, with the same email
    await Promise.all(
      [
        makeFakeProject({ id: '1', email: sameEmailEverywhere }),
        makeFakeProject({ id: '2', email: sameEmailEverywhere })
      ]
        .map(makeProject)
        .filter(item => item.is_ok())
        .map(item => item.unwrap())
        .map(projectRepo.insert)
    )

    const [project, otherProject] = await projectRepo.findAll()

    expect(project).toBeDefined()

    // Add a projectAdmissionKey
    const [projectAdmissionKey] = (
      await Promise.all(
        [
          {
            id: 'projectAdmissionKey',
            projectId: project.id,
            email: sameEmailEverywhere
          }
        ]
          .map(makeProjectAdmissionKey)
          .filter(item => item.is_ok())
          .map(item => item.unwrap())
          .map(projectAdmissionKeyRepo.insert)
      )
    )
      .filter(item => item.is_ok())
      .map(item => item.unwrap())

    expect(projectAdmissionKey).toBeDefined()
    if (!projectAdmissionKey) return

    // Signup with the same email address
    const phonySignup = makePhonySignup({
      projectAdmissionKey: projectAdmissionKey.id,
      projectId: project.id,
      email: sameEmailEverywhere
    })

    const signupResult = await signup(phonySignup)

    expect(signupResult.is_ok())

    // Check if login works
    const userResult = await login({
      email: phonySignup.email,
      password: phonySignup.password
    })

    expect(userResult.is_ok())

    if (!userResult.is_ok()) return

    const user = userResult.unwrap()
    expect(user).toEqual(
      expect.objectContaining({
        firstName: phonySignup.firstName,
        lastName: phonySignup.lastName
      })
    )

    if (!user) return

    // Check if the project has been attached
    const userProjects = await projectRepo.findByUser(user.id)
    expect(userProjects).toHaveLength(2)
    expect(userProjects).toContainEqual(expect.objectContaining(project))
    expect(userProjects).toContainEqual(expect.objectContaining(otherProject))
  })

  it('should create a new user with the single project attached if user used a different email address', async () => {
    const oneEmail = 'one@address.com'
    // Create two fake projects, with the same email
    await Promise.all(
      [
        makeFakeProject({ id: '1', email: oneEmail }),
        makeFakeProject({ id: '2', email: oneEmail })
      ]
        .map(makeProject)
        .filter(item => item.is_ok())
        .map(item => item.unwrap())
        .map(projectRepo.insert)
    )

    const [project] = await projectRepo.findAll()

    expect(project).toBeDefined()

    // Add a projectAdmissionKey
    const [projectAdmissionKey] = (
      await Promise.all(
        [
          {
            id: 'projectAdmissionKey',
            projectId: project.id,
            email: oneEmail
          }
        ]
          .map(makeProjectAdmissionKey)
          .filter(item => item.is_ok())
          .map(item => item.unwrap())
          .map(projectAdmissionKeyRepo.insert)
      )
    )
      .filter(item => item.is_ok())
      .map(item => item.unwrap())

    expect(projectAdmissionKey).toBeDefined()
    if (!projectAdmissionKey) return

    // Signup with another email address
    const phonySignup = makePhonySignup({
      projectAdmissionKey: projectAdmissionKey.id,
      projectId: project.id,
      email: 'other@address.com'
    })

    const signupResult = await signup(phonySignup)

    expect(signupResult.is_ok())

    // Check if login works
    const userResult = await login({
      email: phonySignup.email,
      password: phonySignup.password
    })

    expect(userResult.is_ok())
    if (!userResult.is_ok()) return
    const user = userResult.unwrap()
    expect(user).toEqual(
      expect.objectContaining({
        firstName: phonySignup.firstName,
        lastName: phonySignup.lastName
      })
    )

    if (!user) return

    // Check if the project has been attached
    const userProjects = await projectRepo.findByUser(user.id)
    expect(userProjects).toHaveLength(1)
    expect(userProjects).toContainEqual(expect.objectContaining(project))
  })

  it("should return an error if passwords don't match", async () => {
    const phonySignup = makePhonySignup({
      password: 'a',
      confirmPassword: 'b'
    })
    const signupResult = await signup(phonySignup)

    expect(signupResult.is_err())
    if (!signupResult.is_err()) return

    expect(signupResult.unwrap_err()).toEqual(
      new Error(PASSWORD_MISMATCH_ERROR)
    )
  })

  it('should return an error if firstName or lastName are missing', async () => {
    const phonySignup = makePhonySignup({ firstName: null })
    const signupResult = await signup(phonySignup)

    expect(signupResult.is_err())
    if (!signupResult.is_err()) return

    expect(signupResult.unwrap_err()).toEqual(new Error(USER_INFO_ERROR))
  })

  it('should return an error if email is already used', async () => {
    const phonySignup = makePhonySignup({ email: 'existing@email.com' })
    const signupResult = await signup(phonySignup)

    expect(signupResult.is_err())
    if (!signupResult.is_err()) return

    expect(signupResult.unwrap_err()).toEqual(new Error(EMAIL_USED_ERROR))
  })

  it('should ignore projectAdmissionKey if no projectId', async () => {
    const phonySignup = makePhonySignup({
      projectAdmissionKey: 'projectAdmissionKey'
    })
    const signupResult = await signup(phonySignup)

    expect(signupResult.is_ok())
    if (!signupResult.is_ok()) return
    const user = signupResult.unwrap()
    if (!user) return

    // Check that no project has been attached
    const userProjects = await projectRepo.findByUser(user.id)
    expect(userProjects).toHaveLength(0)
  })

  it("should ignore projectAdmissionKey if it's invalid", async () => {
    const phonySignup = makePhonySignup({
      projectAdmissionKey: 'projectAdmissionKey',
      projectId: '1'
    })
    const signupResult = await signup(phonySignup)

    expect(signupResult.is_ok())
    if (!signupResult.is_ok()) return
    const user = signupResult.unwrap()
    if (!user) return

    // Check that no project has been attached
    const userProjects = await projectRepo.findByUser(user.id)
    expect(userProjects).toHaveLength(0)
  })
})