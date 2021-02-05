import { promises } from 'fs'
const { access } = promises

/**
 * Check if a given path exists
 */
export const pathExists = async (path: string): Promise<boolean> => {
  let pathExists: boolean
  try {
    await access(path)
    pathExists = true
  } catch (error) {
    pathExists = false
  }

  return pathExists
}
