import { getManifestByName, Manifest, ManifestKind } from './manifest'
import { Dependency } from './dependency'
import * as core from './core'
import { getOrigin } from './git'

export async function addDependencies(
  manifest: Manifest,
  dependencyNames: string[],
  dependencyBranch?: string
) {
  if (manifest.kind !== ManifestKind.Present) return

  for (const dependencyName of dependencyNames) {
    if (dependencyName === manifest.name) {
      continue
    }

    dependencyBranch =
      dependencyBranch || (await core.getCurrentBranchByPackageName(dependencyName)) || 'master'

    const dependency = manifest.dependencies.find(x => x.name == dependencyName)
    if (dependency) {
      dependency.branch = dependencyBranch
    } else {
      const dependencyManifest = await getManifestByName(dependencyName)
      if (dependencyManifest) {
        const repo = await getOrigin(dependencyManifest.dir)
        const branch = await dependencyManifest.getBranch()
        const commit = await dependencyManifest.getCommit()
        manifest.dependencies.push(new Dependency(repo, branch, commit))
      } else {
        throw new Error(`Package ${dependencyName} not found`)
      }
    }
  }

  await manifest.write()
}
