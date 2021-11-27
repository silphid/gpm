import { Manifest } from './manifest'
import * as s from './style'
import * as git from './git'

export async function adjust(manifest: Manifest, dependants: boolean = false) {
  if (dependants) await adjustDependants(manifest)
  else await adjustSelf(manifest)
}

async function adjustSelf(manifest: Manifest) {
  let isDirty = false

  for (const dependency of manifest.dependencies) {
    const dependencyManifest = dependency.requiredDependencyManifest
    const branch = await dependencyManifest.getBranch()
    const commit = await dependencyManifest.getCommit()

    if (branch !== dependency.branch || commit !== dependency.commit) {
      console.log(
        `Adjusting ${s.pkg(manifest.name)} -> ${s.pkg(dependencyManifest.name)} ${s.branch(
          branch
        )} ${s.branch(commit)}`
      )
      dependency.branch = branch
      dependency.commit = commit
      isDirty = true
    }
  }

  if (isDirty) {
    await manifest.write()
    await git.stage(manifest.requiredFile)
  }
}

async function adjustDependants(manifest: Manifest) {
  const branch = await manifest.getBranch()
  const commit = await manifest.getCommit()

  for (const dependent of manifest.dependentsManifests) {
    const dependency = dependent.findRequiredDependency(manifest.name)
    if (branch !== dependency.branch || commit !== dependency.commit) {
      console.log(
        `Adjusting ${s.pkg(dependent.name)} -> ${s.pkg(dependency.name)} ${s.branch(
          branch
        )} ${s.branch(commit)}`
      )
      dependency.branch = branch
      dependency.commit = commit
      await dependent.write()
      await git.stage(dependent.requiredFile)
    }
  }
}
