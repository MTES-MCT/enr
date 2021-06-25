const uuid = require('uuid')
const fs = require('fs')

/**
 * This script copies the contents of an exported realm file and replaces all uuid with new ones (to avoid duplicate id error when importing)
 * This is useful to clone realms (export=>cloneRealm.js=>import)
 */

const file = process.argv[2]

const sourceContents = fs.readFileSync(file, { encoding: 'utf-8'})

const uuidRegex = /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/g

console.log(sourceContents.replace(uuidRegex, () => uuid.v4()))