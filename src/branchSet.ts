import * as s from './style'
import { Manifest } from './manifest'

export async function setBranchOfDependents(manifest: Manifest, branch: string) {
  for (const dependent of manifest.dependentsManifests) {
    const dependency = dependent.dependencies.find(x => x.name == manifest.name)
    if (!dependency) {
      throw new Error('Assertion failure: Dependency not found in manifest of dependent')
    }
    if (dependency.branch !== branch) {
      console.log(`Updating ${s.pkg(dependent.name)} manifest: ${s.pkg(dependency.name)} ${s.branch(branch)}`)
      dependency.branch = branch
      await dependent.write()
    }
  }
}
