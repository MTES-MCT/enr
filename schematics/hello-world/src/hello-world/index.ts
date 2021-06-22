import {
  apply,
  mergeWith,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics'
import { Schema } from './Schema'

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function helloWorld(_options: Schema): Rule {
  console.log('helloWorld')
  return (tree: Tree, _context: SchematicContext) => {
    console.log('helloWorld options are', _options)

    const sourceTemplates = url('./files')

    const sourceParametrizedTemplates = apply(sourceTemplates, [template(_options)])

    return mergeWith(sourceParametrizedTemplates)(tree, _context)
  }
}
